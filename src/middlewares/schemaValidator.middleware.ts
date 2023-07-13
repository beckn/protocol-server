import { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { Exception, ExceptionType } from "../models/exception.model";
import { Locals } from "../interfaces/locals.interface";

export const schemaErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Exception) {
    next(err);
  } else {
    const errorData = new Exception(
      ExceptionType.OpenApiSchema_ParsingError,
      "OpenApiValidator Error",
      err.status,
      err
    );

    next(errorData);
  }
};

export const openApiValidatorMiddleware = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction
) => {
  const version = req?.body?.context?.core_version
    ? req?.body?.context?.core_version
    : req?.body?.context?.version;
  const openApiValidator = OpenApiValidator.middleware({
    apiSpec: `schemas/core_${version}.yaml`,
    validateRequests: true,
    validateResponses: false,
    $refParser: {
      mode: "dereference"
    }
  });

  const walkSubstack = function (
    stack: any,
    req: any,
    res: any,
    next: NextFunction
  ) {
    if (typeof stack === "function") {
      stack = [stack];
    }
    const walkStack = function (i: any, err?: any) {
      if (err) {
        return schemaErrorHandler(err, req, res, next);
      }
      if (i >= stack.length) {
        return next();
      }
      stack[i](req, res, walkStack.bind(null, i + 1));
    };
    walkStack(0);
  };
  walkSubstack([...openApiValidator], req, res, next);
};
