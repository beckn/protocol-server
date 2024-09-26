import express, { NextFunction, Request, Response } from "express";
import OpenAPIBackend from "openapi-backend";
import { Context, Document, Handler } from 'openapi-backend';
import fs from "fs";
import path from "path";
import YAML from "yaml";
import * as httpMocks from "node-mocks-http";
import { v4 as uuid_v4 } from "uuid";
import { Exception, ExceptionType } from "../models/exception.model";
import { Locals } from "../interfaces/locals.interface";
import { getConfig } from "../utils/config.utils";
import logger from "../utils/logger.utils";
import { AppMode } from "../schemas/configs/app.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import {
  RequestActions,
  ResponseActions
} from "../schemas/configs/actions.app.config.schema";
import { validationFailHandler } from "../utils/validations.utils";
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import addFormats from 'ajv-formats';

const specFolder = 'schemas';

export class OpenApiValidatorMiddleware {
  private static instance: OpenApiValidatorMiddleware;
  private static cachedOpenApiValidator: {
    [filename: string]: {
      count: number,
      requestHandler: express.RequestHandler[],
      backend: OpenAPIBackend;
      apiSpec: string
    }
  } = {};
  private static cachedFileLimit: number;

  private constructor() {
    OpenApiValidatorMiddleware.cachedFileLimit = getConfig().app.openAPIValidator?.cachedFileLimit || 20;
  }

  public static getInstance(): OpenApiValidatorMiddleware {
    if (!OpenApiValidatorMiddleware.instance) {
      OpenApiValidatorMiddleware.instance = new OpenApiValidatorMiddleware();
    }
    return OpenApiValidatorMiddleware.instance;
  }

  private getApiSpec(specFile: string): string {
    // Simply return the file path instead of parsing it
    return specFile;
  };

  public async initOpenApiMiddleware(): Promise<void> {
    try {
      let fileToCache = getConfig().app?.openAPIValidator?.initialFilesToCache;
      let fileNames, noOfFileToCache = 0;
      const cachedFileLimit: number = OpenApiValidatorMiddleware.cachedFileLimit;
      logger.info(`OpenAPIValidator Total Cache capacity ${cachedFileLimit}`);
      if (fileToCache) {
        fileNames = fileToCache.split(/\s*,\s*/).map(item => item.trim());
        logger.info(`OpenAPIValidator Init no of files to cache:  ${fileNames?.length}`);
        noOfFileToCache = fileNames.length;
      } else {
        const files = fs.readdirSync(specFolder);
        fileNames = files.filter(file => fs.lstatSync(path.join(specFolder, file)).isFile() && (file.endsWith('.yaml') || file.endsWith('.yml')));
        console.log(fileNames)
        noOfFileToCache = Math.min(fileNames.length, 3); //If files to cache is not found in env then we will cache just three file
      }
      noOfFileToCache = Math.min(noOfFileToCache, cachedFileLimit);
      console.log('Cache total files: ', noOfFileToCache);

      for (let i = 0; i < noOfFileToCache; i++) {
        const file = `${specFolder}/${fileNames[i]}`;
        if (!OpenApiValidatorMiddleware.cachedOpenApiValidator[file]) {
          logger.info(`Intially cache Not found loadApiSpec file. Loading.... ${file}`);
          const apiSpec = this.getApiSpec(file);
          const commonResponseHandler: Handler<any, any, any, any, any, Document> = (
            context: Context<any, any, any, any, any, Document>,
            req: Request,
            res: Response,
            next: NextFunction
          ) => {
            // Validation or any processing logic
            if (context.validation && context?.validation?.errors?.length) {
              res.status(400).json({ error: context.validation.errors });
            } else {
              // Pass control to the next middleware indirectly, or handle the response
              res.locals.validated = true; // Use res.locals or another mechanism to track validation
            } // Pass control to the next middleware in the stack
          };
    
          const backend = new OpenAPIBackend({
            definition: apiSpec,
            quick: true,
            validate: true,
            // ajvOpts: {
            //   // Options passed directly to AJV
            //   allErrors: true,
            //   useDefaults: true,
            //   formats: {
            //     // Add custom formats if needed
            //     uri: true,
            //     uuid: true,
            //     'date-time': true,
            //     email: true,
            //   },
            // },
            customizeAjv: (ajv) => {
              addFormats(ajv); // Add default formats including "date", "date-time", etc.
              return ajv; 
            },
            handlers: {
              search: commonResponseHandler,
              select: commonResponseHandler,
              init: commonResponseHandler,
              confirm: commonResponseHandler,
              update: commonResponseHandler,
              cancel: commonResponseHandler,
              status: commonResponseHandler,
              support: commonResponseHandler,
              on_search: commonResponseHandler,
              on_select: commonResponseHandler,
              on_init: commonResponseHandler,
              on_confirm: commonResponseHandler,
              on_update: commonResponseHandler,
              on_cancel: commonResponseHandler,
              on_status: commonResponseHandler,
              on_support: commonResponseHandler,
          
              // This handler catches validation failures
              validationFail: (context, req, res) => {
                res.status(400).json({ error: context.validation.errors });
              },
              // Handle unrecognized paths
              notFound: (context, req, res) => res.status(404).json({ error: 'Not Found' }),
            },
          });

          await backend.init();

          const requestHandler = [this.createValidationMiddleware(backend)];

          OpenApiValidatorMiddleware.cachedOpenApiValidator[file] = {
            backend,
            apiSpec,
            count: 0,
            requestHandler
          }
          await initializeOpenApiValidatorCache(requestHandler);
        }
      }
    } catch (err) {
      logger.error('Error in initializing open API middleware', err);
    }
  }

  public getOpenApiMiddleware(specFile: string): express.RequestHandler[] {
    try {
      let requestHandler: express.RequestHandler[]; // Declare variable
  
      if (OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile]) {
        console.log("Inside Validator cache call");
        const cachedValidator = OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile];
        cachedValidator.count = cachedValidator.count > 1000 ? cachedValidator.count : cachedValidator.count + 1;
        logger.info(`Cache found for spec ${specFile}`);
        requestHandler = cachedValidator.requestHandler; // Assign to requestHandler
      } else {
        const cashedSpec = Object.entries(OpenApiValidatorMiddleware.cachedOpenApiValidator);
        const cachedFileLimit: number = OpenApiValidatorMiddleware.cachedFileLimit;
  
        if (cashedSpec.length >= cachedFileLimit) {
          const specWithLeastCount = cashedSpec.reduce((minEntry, currentEntry) => {
            return currentEntry[1].count < minEntry[1].count ? currentEntry : minEntry;
          }) || cashedSpec[0];
          logger.info(`Cache count reached limit. Deleting from cache.... ${specWithLeastCount[0]}`);
          delete OpenApiValidatorMiddleware.cachedOpenApiValidator[specWithLeastCount[0]];
        }
        logger.info(`Cache Not found loadApiSpec file. Loading.... ${specFile}`);
        const apiSpec = this.getApiSpec(specFile);

        // Adjust your common response handler
        const commonResponseHandler: Handler<any, any, any, any, any, Document> = (
          context: Context<any, any, any, any, any, Document>,
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          // Validation or any processing logic
          if (context.validation && context?.validation?.errors?.length) {
            res.status(400).json({ error: context.validation.errors });
          } else {
            // Pass control to the next middleware indirectly, or handle the response
            res.locals.validated = true; // Use res.locals or another mechanism to track validation
          } // Pass control to the next middleware in the stack
        };
  
        const backend = new OpenAPIBackend({
          definition: apiSpec,
          quick: true,
          validate: true,
          // ajvOpts: {
          //   // Options passed directly to AJV
          //   allErrors: true,
          //   useDefaults: true,
          //   formats: {
          //     // Add custom formats if needed
          //     uri: true,
          //     uuid: true,
          //     'date-time': true,
          //     email: true,
          //   },
          // },
          customizeAjv: (ajv) => {
            addFormats(ajv); // Add default formats including "date", "date-time", etc.
            return ajv; 
          },
          handlers: {
            search: commonResponseHandler,
            select: commonResponseHandler,
            init: commonResponseHandler,
            confirm: commonResponseHandler,
            update: commonResponseHandler,
            cancel: commonResponseHandler,
            status: commonResponseHandler,
            support: commonResponseHandler,
            on_search: commonResponseHandler,
            on_select: commonResponseHandler,
            on_init: commonResponseHandler,
            on_confirm: commonResponseHandler,
            on_update: commonResponseHandler,
            on_cancel: commonResponseHandler,
            on_status: commonResponseHandler,
            on_support: commonResponseHandler,
        
            // This handler catches validation failures
            validationFail: (context, req, res) => {
              // const error = new Exception(
              //   ExceptionType.OpenApiSchema_ParsingError,
              //   `Validation failed`,
              //   400,
              //   context.validation.errors
              // );
              // next(error);
              res.status(400).json({ error: context.validation.errors });
            },
            // Handle unrecognized paths
            notFound: (context, req, res) => res.status(404).json({ error: 'Not Found' }),
            // notFound: (context, req, res, next) => {
            //   // Handle not found by calling next with an error
            //   const error = new Exception(
            //     ExceptionType.Resource_Not_Found,
            //     `Not Found`,
            //     404
            //   );
            //   next(error);
            // },
          },
        });
  
        backend.init(); // Ensure backend is initialized properly
  
        requestHandler = [this.createValidationMiddleware(backend)]; // Assign correctly here
  
        OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile] = {
          apiSpec,
          count: 1,
          requestHandler,
          backend,
        };
      }
  
      const cacheStats = Object.entries(OpenApiValidatorMiddleware.cachedOpenApiValidator).map((cache) => {
        return {
          count: cache[1].count,
          specFile: cache[0],
        };
      });
      console.table(cacheStats);
      return requestHandler;
    } catch (err) {
      logger.error('Error in getOpenApiMiddleware', err);
      return [];
    }
  }

  // Custom Middleware creation with proper handling
private createValidationMiddleware(backend: OpenAPIBackend): express.RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const context = await backend.handleRequest(
        {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query as any,
          headers: req.headers as Record<string, string | string[]>,
        },
        req,
        res
      );

      // Check if validation was successful or flagged in the response handler
      if (res.locals.validated) {
        next(); // Proceed to the next middleware
      }
    } catch (error) {
      next(error); // Proper error handling
    }
  };
}


}





const initializeOpenApiValidatorCache = async (stack: any) => {
  try {
    let actions: string[] = [];
    if (
      (getConfig().app.mode === AppMode.bap &&
        getConfig().app.gateway.mode === GatewayMode.client) ||
      (getConfig().app.mode === AppMode.bpp &&
        getConfig().app.gateway.mode === GatewayMode.network)
    ) {
      actions = Object.keys(RequestActions);
    } else {
      actions = Object.keys(ResponseActions);
    }

    actions.forEach((action) => {
      const mockRequest = (body: any) => {
        const req = httpMocks.createRequest({
          method: "POST",
          url: `/${action}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: uuid_v4()
          },
          body: body
        });

        req.app = {
          enabled: (setting: any) => {
            if (
              setting === "strict routing" ||
              setting === "case sensitive routing"
            ) {
              return true;
            }
            return false;
          }
        } as any;
        return req;
      };

      const reqObj = mockRequest({
        context: { action: `${action}` },
        message: {}
      });

      walkSubstack(stack, reqObj, {}, () => {
        return;
      }, false);
    });
  } catch (error: any) { }
};

export const schemaErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Inside schemaErrorHandler")
  logger.error('OpenApiValidator Error', err);
  if (err instanceof Exception) {
    next(err);
  } else {
    if (getConfig().app.mode === AppMode.bpp) {
      console.log('OpenApiValidator Error', err);``
      if (getConfig().app.gateway.mode === GatewayMode.client) {
        req.body = {
          ...req.body,
          error: {
            code: err.status + '',
            path: err.path,
            message: err.message
          }
        }
        delete req.body?.message;
        next();
      }

      if (getConfig().app.gateway.mode === GatewayMode.network) {
        validationFailHandler(req, err);
      }
      return;
    }
    const protocolServerLevel = `${getConfig().app.mode.toUpperCase()}-${getConfig().app.gateway.mode.toUpperCase()}`;
    const errorData = new Exception(
      ExceptionType.OpenApiSchema_ParsingError,
      `OpenApiValidator Error at ${protocolServerLevel}`,
      err.status,
      err
    );
    next(errorData);
  }
};

const walkSubstack = function (
  stack: any,
  req: any,
  res: any,
  next: NextFunction,
  reportError = true
) {
  if (typeof stack === "function") {
    stack = [stack];
  }
  const walkStack = function (i: any, err?: any) {
    if (err && reportError) {
      return schemaErrorHandler(err, req, res, next);
    }
    if (i >= stack.length) {
      return next();
    }
    stack[i](req, res, walkStack.bind(null, i + 1));
  };
  walkStack(0);
};

export const openApiValidatorMiddleware = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction
) => {
  const version = req?.body?.context?.core_version
    ? req?.body?.context?.core_version
    : req?.body?.context?.version;
  let specFile = `${specFolder}/core_${version}.yaml`;

  if (getConfig().app.useLayer2Config) {
    let doesLayer2ConfigExist = false;
    let layer2ConfigFilename = `${(req?.body?.context?.domain).toLowerCase()}_${version}.yaml`;
    console.log(layer2ConfigFilename)
    let specialCharsRe = /[:\/]/gi;
    layer2ConfigFilename = layer2ConfigFilename.replace(specialCharsRe, "_");
    try {
      doesLayer2ConfigExist = (
        await fs.promises.readdir(
          `${path.join(path.resolve(__dirname, "../../"))}/${specFolder}`
        )
      ).includes(layer2ConfigFilename);
      console.log("doesLayer2ConfigExist", doesLayer2ConfigExist)
    } catch (error) {
      doesLayer2ConfigExist = false;
    }
    if (doesLayer2ConfigExist) {specFile = `${specFolder}/${layer2ConfigFilename}`;
    console.log(specFile);}
    else {
      if (getConfig().app.mandateLayer2Config) {
        const message = `Layer 2 config file ${layer2ConfigFilename} is not installed and it is marked as required in configuration`
        logger.error(message);
        return next(
          new Exception(
            ExceptionType.Config_AppConfig_Layer2_Missing,
            message,
            422
          )
        );
      }
    }
  }
  const openApiValidator = OpenApiValidatorMiddleware.getInstance().getOpenApiMiddleware(specFile);
  walkSubstack([...openApiValidator], req, res, next);
};