import _sodium, { base64_variants } from "libsodium-wrappers";
import * as crypto from 'crypto';
import { writeFile } from "fs/promises";
import logger from "./logger.utils";
import { Request, Response } from "express";
import { getSubscriberDetails } from "./lookup.utils";
import { Exception, ExceptionType } from "../models/exception.model";
import { getConfig } from "./config.utils";
import { SubscriberDetail } from "../schemas/subscriberDetails.schema";

export const createKeyPair = async (): Promise<void> => {
  await _sodium.ready;
  const sodium = _sodium;
  let { publicKey, privateKey } = sodium.crypto_sign_keypair();
  const publicKey_base64 = sodium.to_base64(
    publicKey,
    base64_variants.ORIGINAL
  );
  const privateKey_base64 = sodium.to_base64(
    privateKey,
    base64_variants.ORIGINAL
  );
  await writeFile("./publicKey.pem", publicKey_base64);
  await writeFile("./privateKey.pem", privateKey_base64);
};

export const createSigningString = async (
  message: string,
  created?: string,
  expires?: string
) => {
  //if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
  if (!created)
    created = Math.floor(new Date().getTime() / 1000 - 1 * 60).toString(); //TO USE IN CASE OF TIME ISSUE
  if (!expires) expires = (parseInt(created) + 1 * 60 * 60).toString(); //Add required time to create expired
  //const digest = createBlakeHash('blake512').update(JSON.stringify(message)).digest("base64");
  //const digest = blake2.createHash('blake2b', { digestLength: 64 }).update(Buffer.from(message)).digest("base64");
  await _sodium.ready;
  const sodium = _sodium;
  const digest = sodium.crypto_generichash(64, sodium.from_string(message));
  const digest_base64 = sodium.to_base64(digest, base64_variants.ORIGINAL);
  const signing_string = `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`;
  logger.info(
    `\n*********************************-----***********************************
    Signing String:==>\n${signing_string}\n*********************************-----***********************************\n`
  );
  return { signing_string, expires, created };
};

export const signMessage = async (
  signing_string: string,
  privateKey: string
) => {
  await _sodium.ready;
  const sodium = _sodium;
  const signedMessage = sodium.crypto_sign_detached(
    signing_string,
    sodium.from_base64(privateKey, base64_variants.ORIGINAL)
  );
  return sodium.to_base64(signedMessage, base64_variants.ORIGINAL);
};

export const createAuthorizationHeader = async (message: any) => {
  const { signing_string, expires, created } = await createSigningString(
    JSON.stringify(message)
  );
  const signature = await signMessage(
    signing_string,
    getConfig().app.privateKey || ""
  );
  const subscriber_id = getConfig().app.subscriberId;
  const header = `Signature keyId="${subscriber_id}|${getConfig().app.uniqueKey
    }|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;
  return header;
};

export const verifyMessage = async (
  signedString: string,
  signingString: string,
  publicKey: string
) => {
  try {
    await _sodium.ready;
    const sodium = _sodium;
    return sodium.crypto_sign_verify_detached(
      sodium.from_base64(signedString, base64_variants.ORIGINAL),
      signingString,
      sodium.from_base64(publicKey, base64_variants.ORIGINAL)
    );
  } catch (error) {
    return false;
  }
};

const remove_quotes = (value: string) => {
  if (
    value.length >= 2 &&
    value.charAt(0) == '"' &&
    value.charAt(value.length - 1) == '"'
  ) {
    value = value.substring(1, value.length - 1);
  }
  return value;
};

const split_auth_header = (auth_header: string) => {
  const header = auth_header.replace("Signature ", "");
  let re = /\s*([^=]+)=([^,]+)[,]?/g;
  let m;
  let parts: any = {};
  while ((m = re.exec(header)) !== null) {
    if (m) {
      parts[m[1]] = remove_quotes(m[2]);
    }
  }
  return parts;
};

const split_auth_header_space = (auth_header: string) => {
  const header = auth_header.replace("Signature ", "");
  let re = /\s*([^=]+)=\"([^"]+)"/g;
  let m;
  let parts: any = {};
  while ((m = re.exec(header)) !== null) {
    if (m) {
      parts[m[1]] = m[2];
    }
  }
  return parts;
};

export async function getSenderDetails(
  header: string
): Promise<SubscriberDetail> {
  try {
    logger.info(`Header recieved from bpp: ${JSON.stringify(header)}`);
    const parts = split_auth_header(header);
    if (!parts || Object.keys(parts).length === 0) {
      throw new Error("Header parsing failed");
    }

    const subscriber_id = parts["keyId"].split("|")[0] as string;
    const unique_key_id = parts["keyId"].split("|")[1] as string;

    const subscriber_details = await getSubscriberDetails(
      subscriber_id,
      unique_key_id
    );
    return subscriber_details;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function verifyHeader(
  header: string,
  req: Request,
  res: Response
) {
  try {
    const parts = split_auth_header(header);
    if (!parts || Object.keys(parts).length === 0) {
      throw new Exception(
        ExceptionType.Authentication_HeaderParsingFailed,
        "Header parsing failed",
        401
      );
    }

    const subscriber_id = parts["keyId"].split("|")[0];
    const unique_key_id = parts["keyId"].split("|")[1];
    const subscriber_details = await getSubscriberDetails(
      subscriber_id,
      unique_key_id
    );
    console.log(req.body?.context?.transaction_id, subscriber_details);
    const public_key = subscriber_details.signing_public_key;
    const { signing_string } = await createSigningString(
      res.locals.rawBody,
      parts["created"],
      parts["expires"]
    );
    const verified = await verifyMessage(
      parts["signature"],
      signing_string,
      public_key
    );
    return verified;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export const createAuthHeaderConfig = async (request: any) => {
  const header = await createAuthorizationHeader(request);
  const axios_config = {
    headers: {
      authorization: header
    },
    timeout: getConfig().app.httpTimeout
  };
  logger.info(
    `Axios Config for Request from ${getConfig().app.mode + " " + getConfig().app.gateway.mode
    }:==>\n${JSON.stringify(axios_config)}\n\n`
  );
  return axios_config;
};

const createBppWebhookAuthHeader = async (request: any) => {
  const key = getConfig().app.sharedKeyForWebhookHMAC || "";
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(JSON.stringify(request));
  return hmac.digest('hex');
};

export const createBppWebhookAuthHeaderConfig = async (request: any) => {
  const header = await createBppWebhookAuthHeader(request);
  const axios_config = {
    headers: {
      authorization: `HMAC-SHA-256 ${header}`
    }
  };
  logger.info(
    `Axios Config for Request from ${getConfig().app.mode + " " + getConfig().app.gateway.mode
    }:==>\n${JSON.stringify(axios_config)}\n\n`
  );
  return axios_config;
};
