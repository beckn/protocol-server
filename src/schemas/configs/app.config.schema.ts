// Create app config schema.
// Create a parser function.

import moment from "moment";
import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";
import { actionsAppConfigSchema } from "./actions.app.config.schema";
import { gatewayAppConfigSchema } from "./gateway.app.config.schema";

export enum AppMode {
  bap = "bap",
  bpp = "bpp"
}

export const appConfigSchema = z.object({
  mode: z.nativeEnum(AppMode),

  gateway: gatewayAppConfigSchema,

  actions: actionsAppConfigSchema,

  privateKey: z.string(),
  publicKey: z.string(),

  subscriberId: z.string(),
  subscriberUri: z.string(),

  registryUrl: z.string(),
  auth: z.boolean(),
  uniqueKey: z.string(),

  city: z.string(),
  country: z.string(),

  ttl: z.string().transform((value) => {
    const duration = moment.duration(value);
    return duration.asMilliseconds();
  }),

  httpTimeout: z.string().transform((value) => {
    const duration = moment.duration(value);
    return duration.asMilliseconds();
  }),
  httpRetryCount: z.number(),

  telemetry: z.object({
    network: z.object({
      url: z.string()
    }),
    raw: z.object({
      url: z.string()
    }),
    batchSize: z.number(),
    syncInterval: z.number(),
    storageType: z.string(),
    backupFilePath: z.string(),
    redis: z.object({
      db: z.number()
    }),
    messageProperties: z.array(z.object({
      key: z.string(),
      path: z.string()
    })).default([])
  }),
  service: z.object({
    name: z.string(),
    version: z.string()
  }),
  useLayer2Config: z.boolean().optional(),
  mandateLayer2Config: z.boolean().optional(),
  unsolicitedWebhook: z.object({
    url: z.string().optional()
  }).optional(),
  useHMACForWebhook: z.boolean().optional(),
  sharedKeyForWebhookHMAC: z.string().optional(),
  openAPIValidator: z.object({
    cachedFileLimit: z.number().optional(),
    cacheSizeLimit: z.number().optional()
  }).optional(),
  streamOnSearch: z.boolean().optional()
});

export type AppConfigDataType = z.infer<typeof appConfigSchema>;

export const parseAppConfig = (config: any): AppConfigDataType => {
  if (!config) {
    throw new Exception(
      ExceptionType.Config_AppConfig_NotFound,
      "App config not found",
      404
    );
  }

  try {
    const appConfig = appConfigSchema.parse(config);
    if (appConfig.mandateLayer2Config && !appConfig.useLayer2Config)
      throw new Error("If mandateLayer2Config value is true, useLayer2Config should also be true")
    return appConfig;
  } catch (e) {
    throw new Exception(
      ExceptionType.Config_AppConfig_Invalid,
      "Invalid app config",
      400,
      e
    );
  }
};
