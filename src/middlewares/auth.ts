import { NextFunction, Request, Response } from "express";
import { verifyHeader } from "../utils/auth";
import logger from "../utils/logger";
const config = require("config");

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("\nNew Request txn_id", req.body?.context?.transaction_id);
        if (req.body?.context?.bap_id) {
            console.log(req.body?.context?.transaction_id, "Request from", req.body?.context?.bpp_id)
        }
        const auth_header = req.headers['authorization'] || "";
        const proxy_header = req.headers['proxy-authorization'] || "";
        console.log(req.body?.context?.transaction_id, "headers", req.headers )
        
        const isAuthRequired=config.get('app.auth');
        if (isAuthRequired) {
            var verified = await verifyHeader(auth_header, req);
            var verified_proxy = proxy_header ? await verifyHeader(proxy_header, req) : true;
            console.log(req.body?.context?.transaction_id, "Verification status:", verified, "Proxy verification:", verified_proxy);
            if (!verified || !verified_proxy) {
                throw Error("Header verification failed");
            }
        }
        
        next();
    } catch (e) {
        console.log(req.body?.context?.transaction_id, (e as Error).message);
        logger.error(e);
        res.status(401).send('Authentication failed');
    }
}