import { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { Exception, ExceptionType } from "../models/exception.model";

export const openApiValidator = OpenApiValidator.middleware({
  apiSpec: "schemas/core_1.1.0.yaml",
  validateRequests: true,
  validateResponses: false,
  $refParser: {
    mode: "dereference"
  }
});

export const schemaErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Exception) {
    console.log("\nerr=====>====>", err, "\n");
    next(err);
  } else {
    const errorData = new Exception(
      ExceptionType.OpenApiSchema_ParsingError,
      "OpenApiValidator Error",
      err.status,
      err
    );
    console.log("\nerrorData=>=>=>", errorData, "\n");
    next(errorData);
  }
};

const openApiValidatorMiddleware = [...openApiValidator, schemaErrorHandler];
export default openApiValidatorMiddleware;
