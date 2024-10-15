import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Exception, ExceptionType } from "../models/exception.model";
import { Locals } from "../interfaces/locals.interface";
import { getConfig } from "../utils/config.utils";
import logger from "../utils/logger.utils";
import { AppMode } from "../schemas/configs/app.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { Validator } from "./validator";
import { validationFailHandler } from "../utils/validations.utils";

const specFolder = 'schemas';

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

export const openApiValidatorMiddleware = async (
  req: Request,
  res: Response<{}, Locals>,
  next: NextFunction
) => {
  const version = req?.body?.context?.core_version
    ? req?.body?.context?.core_version
    : req?.body?.context?.version;
  let specFile = `${specFolder}/core_${version}.yaml`;
  let specFileName = `core_${version}.yaml`;
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
    if (doesLayer2ConfigExist) {
      specFile = `${specFolder}/${layer2ConfigFilename}`;
      specFileName = layer2ConfigFilename;
    }
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
  const validatorInstance = Validator.getInstance();
  const openApiValidator = await validatorInstance.getValidationMiddleware(specFile, specFileName);
  // Call the openApiValidator and handle the response
  await openApiValidator(req, res, (err: any) => {
    if (err) {
      schemaErrorHandler(err, req, res, next);
    } else {
      logger.info('Validation Success');
      next();
    }
  });
};
