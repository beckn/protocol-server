import express, { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import * as httpMocks from "node-mocks-http";
import { v4 as uuid_v4 } from "uuid";
import { Exception, ExceptionType } from "../models/exception.model";
import { Locals } from "../interfaces/locals.interface";
import { getConfig } from "../utils/config.utils";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import logger from "../utils/logger.utils";
import { AppMode } from "../schemas/configs/app.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import {
  RequestActions,
  ResponseActions
} from "../schemas/configs/actions.app.config.schema";
import { validationFailHandler } from "../utils/validations.utils";

const specFolder = 'schemas';

export class OpenApiValidatorMiddleware {
  private static instance: OpenApiValidatorMiddleware;
  private static cachedOpenApiValidator: {
    [filename: string]: {
      count: number,
      requestHandler: express.RequestHandler[],
      apiSpec: OpenAPIV3.Document
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

  private getApiSpec(specFile: string): OpenAPIV3.Document {
    const apiSpecYAML = fs.readFileSync(specFile, "utf8");
    const apiSpec = YAML.parse(apiSpecYAML);
    return apiSpec;
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
        noOfFileToCache = Math.min(fileNames.length, 3); //If files to cache is not found in env then we will cache just three file
      }
      noOfFileToCache = Math.min(noOfFileToCache, cachedFileLimit);
      console.log('Cache total files: ', noOfFileToCache);

      for (let i = 0; i < noOfFileToCache; i++) {
        const file = `${specFolder}/${fileNames[i]}`;
        if (!OpenApiValidatorMiddleware.cachedOpenApiValidator[file]) {
          logger.info(`Intially cache Not found loadApiSpec file. Loading.... ${file}`);
          const apiSpec = this.getApiSpec(file);
          const requestHandler = OpenApiValidator.middleware({
            apiSpec,
            validateRequests: true,
            validateResponses: false,
            $refParser: {
              mode: "dereference"
            }
          })
          OpenApiValidatorMiddleware.cachedOpenApiValidator[file] = {
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
      let requestHandler: express.RequestHandler[];
      if (OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile]) {
        const cachedValidator = OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile];
        cachedValidator.count = cachedValidator.count > 1000 ? cachedValidator.count : cachedValidator.count + 1;
        logger.info(`Cache found for spec ${specFile}`);
        requestHandler = cachedValidator.requestHandler;
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
        OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile] = {
          apiSpec,
          count: 1,
          requestHandler: OpenApiValidator.middleware({
            apiSpec,
            validateRequests: true,
            validateResponses: false,
            $refParser: {
              mode: "dereference"
            }
          })
        }
        requestHandler = OpenApiValidatorMiddleware.cachedOpenApiValidator[specFile].requestHandler;
      }
      const cacheStats = Object.entries(OpenApiValidatorMiddleware.cachedOpenApiValidator).map((cache) => {
        return {
          count: cache[1].count,
          specFile: cache[0]
        }
      });
      console.table(cacheStats);
      return requestHandler;
    } catch (err) {
      logger.error('Error in getOpenApiMiddleware', err);
      return []
    }
  };
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
  logger.error('OpenApiValidator Error', err);
  if (err instanceof Exception) {
    next(err);
  } else {
    if (getConfig().app.mode === AppMode.bpp) {
      console.log('OpenApiValidator Error', err);
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
    let layer2ConfigFilename = `${req?.body?.context?.domain}_${version}.yaml`;
    let specialCharsRe = /[:\/]/gi;
    layer2ConfigFilename = layer2ConfigFilename.replace(specialCharsRe, "_");
    try {
      doesLayer2ConfigExist = (
        await fs.promises.readdir(
          `${path.join(path.resolve(__dirname, "../../"))}/${specFolder}`
        )
      ).includes(layer2ConfigFilename);
    } catch (error) {
      doesLayer2ConfigExist = false;
    }
    if (doesLayer2ConfigExist) specFile = `${specFolder}/${layer2ConfigFilename}`;
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
