import { NextFunction, Request, Response } from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import { Exception, ExceptionType } from '../models/exception.model'

const openApiValidator = OpenApiValidator.middleware({
    apiSpec: "schemas/core.yaml",
    validateRequests: true,
    validateResponses: false,
    $refParser: {
        mode: 'dereference'
    }
})

const schemaErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof Exception){
        next(err);
    }
    else{
        const errorData=new Exception(ExceptionType.OpenApiSchema_ParsingError, "OpenApiValidator Error", err.status, err);
        next(errorData);    
    }
}

const openApiValidatorMiddleware=[
    ...openApiValidator,
    schemaErrorHandler
];
export default openApiValidatorMiddleware;
