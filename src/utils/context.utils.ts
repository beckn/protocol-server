import moment from "moment";
import fs from "fs";
import { v4 as uuid_v4 } from "uuid";
import { Exception, ExceptionType } from "../models/exception.model";
import { ActionUtils } from "./actions.utils";
import { getConfig } from "./config.utils";
import logger from "./logger.utils";

export const bapContextBuilder = async (
  context: any,
  action: string
): Promise<any> => {
  const protocolServerlLevel = `${getConfig().app.mode.toUpperCase()}-${getConfig().app.gateway.mode.toUpperCase()}`;
  if (!context) {
    throw new Exception(
      ExceptionType.Context_NotFound,
      `Context not found in request to ${protocolServerlLevel}`,
      404
    );
  }
  if (!context.domain) {
    throw new Exception(
      ExceptionType.Context_DomainNotFound,
      `Domain not found in the context in request to ${protocolServerlLevel}`,
      404
    );
  }
  if (!context.version && !context?.core_version) {
    throw new Exception(
      ExceptionType.Context_CoreVersionNotFound,
      `Core version not found in the context in request to ${protocolServerlLevel}`,
      404
    );
  }

  const rawdata: any = await fs.promises.readFile(
    `schemas/context_${context.version ? context.version : context.core_version
    }.json`
  );

  const bapContext = Object.entries(JSON.parse(rawdata)).reduce(
    (accum: any, [key, val]: any) => {
      accum[key] = eval(val);
      return accum;
    },
    {
      ttl: moment.duration(getConfig().app.ttl, "ms").toISOString(),
      action: ActionUtils.parseAction(context.action),
      timestamp: new Date().toISOString(),
      message_id: context?.message_id ? context?.message_id : uuid_v4(),
      key: context?.key,
      transaction_id: context.transaction_id
        ? context.transaction_id
        : uuid_v4()
    }
  );
  logger.info(
    `BAP Context created at ${protocolServerlLevel} :==>\n${JSON.stringify(
      bapContext
    )}\n`
  );
  //remove all keys having null or undefined values for validation
  for (const key in bapContext) {
    if (bapContext[key] === undefined || bapContext[key] === null) {
      delete bapContext[key];
    }
  }
  return bapContext;
};

export const bppContextBuilder = (context: any, action: string): any => {
  const protocolServerlLevel = `${getConfig().app.mode.toUpperCase()}-${getConfig().app.gateway.mode.toUpperCase()}`;

  if (!context) {
    throw new Exception(
      ExceptionType.Context_NotFound,
      `Context not found in request to ${protocolServerlLevel}`,
      404
    );
  }
  if (!context.domain) {
    throw new Exception(
      ExceptionType.Context_DomainNotFound,
      `Domain not found in the context in request to ${protocolServerlLevel}`,
      404
    );
  }
  if (!context.core_version && !context.version) {
    throw new Exception(
      ExceptionType.Context_CoreVersionNotFound,
      `Core version not found in the context in request to ${protocolServerlLevel}`,
      404
    );
  }
  if (!context.transaction_id) {
    throw new Exception(
      ExceptionType.Context_TransactionIdNotFound,
      `transaction_id not found in the context in request to ${protocolServerlLevel}`,
      404
    );
  }
  if (!context.message_id) {
    throw new Exception(
      ExceptionType.Context_MessageIdNotFound,
      `message_id not found in the context in request to ${protocolServerlLevel}`,
      404
    );
  }

  const bppContext: any = {
    domain: context.domain,
    action: ActionUtils.parseAction(context.action),
    version: context?.version,
    core_version: context?.core_version,
    bpp_id: context.bpp_id ? context.bpp_id : getConfig().app.subscriberId,
    bpp_uri: context.bpp_uri ? context.bpp_uri : getConfig().app.subscriberUri,
    country: context?.country ? context.country : getConfig().app.country,
    city: context?.city ? context.city : getConfig().app.city,
    location: context?.location,

    bap_id: context.bap_id,
    bap_uri: context.bap_uri,

    transaction_id: context.transaction_id,
    message_id: context.message_id,

    ttl: moment.duration(getConfig().app.ttl, "ms").toISOString(),
    timestamp: new Date().toISOString()
  };
  return bppContext;
};
