// import axios from "axios";
// import {
//   telemetryCache,
//   telemetryEnvelop
// } from "../schemas/cache/telemetry.cache";
// import { getConfig } from "../utils/config.utils";
// import logger from "../utils/logger.utils";
// import axiosRetry from "axios-retry";
// import { v1 } from "uuid";
// import { RedisClient } from "./redis.utils";
// import { ScanStream } from "ioredis";
// import { AppMode } from "../schemas/configs/app.config.schema";
// import { RequestActions } from "../schemas/configs/actions.app.config.schema";
// axiosRetry(axios, { retries: getConfig().app.httpRetryCount });
import { NextFunction, Request, Response } from "express";
import { getConfig } from "./config.utils";
import TelemetrySDK from 'beckn-telemetry-sdk';
import _ from 'lodash';

// const constructCdata = (message: any) => {
//   const cdata: any = [];
//   if (message.context.hasOwnProperty("location")) {
//     Object.entries(message.context.location).map(
//       ([dataKey, dataValue]: any) => {
//         cdata.push({
//           type: dataKey,
//           value: dataValue.name,
//           valueType: "string"
//         });
//         cdata.push({
//           type: dataKey + "code",
//           value: dataValue.code,
//           valueType: "string"
//         });
//       }
//     );
//   }
//   return cdata;
// };

export const telemetrySDK = TelemetrySDK


export const getTelemetryConfig = () => {
  return {
      "participantId": getConfig().app.subscriberId,
      "participantUri": getConfig().app.subscriberUri,
      "role": getConfig().app.mode,
      "telemetry": {
          "batchSize": getConfig().app.telemetry.batchSize,
          "syncInterval": getConfig().app.telemetry.syncInterval,
          "retry": getConfig().app.httpRetryCount,
          "storageType": getConfig().app.telemetry.storageType,
          "backupFilePath": getConfig().app.telemetry.backupFilePath,
          "redis": {
              "host": getConfig().cache.host,
              "port": getConfig().cache.port,
              "db": getConfig().app.telemetry.redis.db
          },
          "network": {
              "url": getConfig().app.telemetry.network.url
          },
          "raw": {
              "url": getConfig().app.telemetry.raw.url
          }
      },
      "service": {
          "name": getConfig().app.service.name,
          "version": getConfig().app.service.version
      }
  }
}

export const onAPI = (request: Request, response: Response, next: NextFunction) => {
  const mode = request.get('mode');
  const requestBody = request.body || {};
  const additionalCustomAttrsConfig = getConfig().app.telemetry.messageProperties;
  const additionalCustomAttrs = customAttributes(requestBody, additionalCustomAttrsConfig);
  TelemetrySDK.onApi({ data: { attributes: { mode, ...additionalCustomAttrs } } })(request, response, next)
}



export const customAttributes = (ctx: Record<string, any>, config: { key: string, path: string }[]) => {
  const reducerFn = (prev: Record<string, any>, current: { key: string, path: string }) => {
      const { key, path } = current;
      if (_.includes(path, '[]')) {
          const values = resolveArrayPath(ctx, path);
          if (values) {
              _.forEach(values, (value, index) => {
                  const keyWithIndex = `${key}.${index}`;
                  !_.get(prev, keyWithIndex) && value && (prev[keyWithIndex] = value);
              })
          }
      } else {
          const value = _.get(ctx, path);
          !_.get(prev, key) && value && (prev[key] = value);
      }
      return prev;
  }
  return _.reduce(config, reducerFn, {});
}

const resolveArrayPath = (ctx: Record<string, any>, path: string) => {
  const splits = _.split(path, '[]');
  const reducerFn = (value: any, path: string) => {
      if (_.startsWith(path, '.')) {
          if (!value) return null
          return _.flatten(_.map(value, payload => _.get(payload, _.replace(path, '.', ''))));
      } else {
          return _.get(ctx, path);
      }
  }
  return _.reduce(splits, reducerFn, ctx);
}