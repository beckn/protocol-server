import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";
import { AppMode } from "../schemas/configs/app.config.schema";
import { NetworkPaticipantType } from "../schemas/subscriberDetails.schema";
import {
  createAuthHeaderConfig,
  getSenderDetails,
  verifyHeader,
} from "../utils/auth.utils";
import { getConfig } from "../utils/config.utils";
import logger from "../utils/logger.utils";
import { getSubscriberDetails } from "../utils/lookup.utils";
const config = require("config");

export const authValidatorMiddleware = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction
) => {
  try {
    logger.info(`\nNew Request txn_id ${req.body?.context?.transaction_id}`);
    logger.info(
      `Request from ${
        req?.body?.context?.bpp_id && req?.body?.context?.bpp_uri
          ? "BAP NETWORK"
          : "BG"
      } ${JSON.stringify(req.body)}`
    );
    console.log("\nNew Request txn_id", req.body?.context?.transaction_id);
    if (req.body?.context?.bap_id) {
      console.log(
        req.body?.context?.transaction_id,
        "Request from",
        req.body?.context?.bpp_id
      );
    }
    const auth_header = req.headers["authorization"] || "";
    const proxy_header = req.headers["proxy-authorization"] || "";
    console.log(req.body?.context?.transaction_id, "headers", req.headers);

    let authVerified = true;
    const isAuthRequired = config.get("app.auth");
    if (isAuthRequired) {
      var verified = await verifyHeader(auth_header, req, res);
      var verified_proxy = proxy_header
        ? await verifyHeader(proxy_header, req, res)
        : true;
      console.log(
        req.body?.context?.transaction_id,
        "Verification status:",
        verified,
        "Proxy verification:",
        verified_proxy
      );
      authVerified = verified && verified_proxy;
    }

    if (authVerified) {
      const senderDetails = await getSenderDetails(auth_header);
      res.locals.sender = senderDetails;
      next();
    } else {
      res.status(401).json({
        message: {
          ack: {
            status: "NACK",
          },
        },
        error: {
          message: "Authentication failed",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

export async function authBuilderMiddleware(
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction
) {
  try {
    logger.info(`Building Auth Header\n`);
    const axios_config = await createAuthHeaderConfig(req.body);
    req.headers.authorization = axios_config.headers.authorization;
    const senderDetails = await getSubscriberDetails(
      getConfig().app.subscriberId,
      getConfig().app.uniqueKey
    );
    res.locals.sender = senderDetails;
    next();
  } catch (error) {
    next(error);
  }
}
