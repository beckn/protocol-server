import { NextFunction, Request, Response } from "express";
import { Locals } from "../interfaces/locals.interface";
import requestIp from "request-ip";
export async function jsonCompressorMiddleware(
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction
) {
  // Here we are intentionally converting the raw body to req.body.
  // As we need to avoid the signature that can be caused due to the fact that
  // spaces and tabs in json body are left in the req.body even after the conversion to string.
  console.log(
    "Request from IP address ======>======>=====>===>",
    requestIp.getClientIp(req),
    "\n\n",
    "Req From URL======>",
    req.headers.referer,
    "\n\n"
  );
  req.body = res.locals.rawBody ? JSON.parse(res.locals.rawBody) : null;
  next();
}
