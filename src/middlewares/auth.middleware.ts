import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";
import { createAuthHeaderConfig, getSenderDetails, verifyHeader } from "../utils/auth.utils";
import logger from "../utils/logger.utils";
const config = require("config");

export const authValidatorMiddleware = async (req: Request, res: Response<{}, Locals>, next: NextFunction) => {
    try {
        console.log("\nNew Request txn_id", req.body?.context?.transaction_id);
        if (req.body?.context?.bap_id) {
            console.log(req.body?.context?.transaction_id, "Request from", req.body?.context?.bpp_id)
        }
        const auth_header = req.headers['authorization'] || "";
        const proxy_header = req.headers['proxy-authorization'] || "";
        console.log(req.body?.context?.transaction_id, "headers", req.headers)

        let authVerified = true;
        const isAuthRequired = config.get('app.auth');
        if (isAuthRequired) {
            var verified = await verifyHeader(auth_header, req, res);
            var verified_proxy = proxy_header ? await verifyHeader(proxy_header, req, res) : true;
            console.log(req.body?.context?.transaction_id, "Verification status:", verified, "Proxy verification:", verified_proxy);
            authVerified = verified && verified_proxy;
        }

        if (authVerified) {
            const senderDetails=await getSenderDetails(auth_header);
            res.locals.sender = senderDetails;
            next();
        }
        else {
            res.status(401).json({
                message: {
                    ack: {
                        status: "NACK"
                    }
                },
                error: {
                    message: "Authentication failed"
                }
            });
        }
    } catch (err) {
        next(err)
    }
}

export async function authBuilderMiddleware(req: Request, res: Response<{}, Locals>, next: NextFunction) {
    try {
        const axios_config = await createAuthHeaderConfig(req.body);
        req.headers.authorization = axios_config.headers.authorization;
        next();
    } catch (error) {
        next(error)
    }
}