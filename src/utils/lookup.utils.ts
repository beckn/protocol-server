import axios from "axios";
import { Exception, ExceptionType } from "../models/exception.model";
import { LookupParameter } from "../schemas/lookupParameter.schema";
import {
  SubscriberDetail,
  subscriberDetailsSchema
} from "../schemas/subscriberDetails.schema";
import { getConfig } from "./config.utils";
import { LookupCache } from "./cache/lookup.cache.utils";
import logger from "./logger.utils";

export function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL
    ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
    : baseURL;
}

export const registryLookup = async (lookupParameter: LookupParameter) => {
  const protocolServerLevel = `${getConfig().app.mode.toUpperCase()}-${getConfig().app.gateway.mode.toUpperCase()}`;
  try {
    const lookupCache = LookupCache.getInstance();
    const cachedResponse = await lookupCache.check(lookupParameter);
    if (cachedResponse && cachedResponse!.length > 0) {
      logger.info(
        `\nReturning response from Cache at ${protocolServerLevel}\n`
      );
      logger.info(
        `CachedResponse at ${protocolServerLevel}: ${JSON.stringify(
          cachedResponse
        )}`
      );
      return cachedResponse;
    }
    logger.info(
      `\nLooking Up in registry from ${protocolServerLevel}...! to URL:${combineURLs(
        getConfig().app.registryUrl,
        "/lookup"
      )}\nPayload:${JSON.stringify(lookupParameter)}\n\n`
    );

    const response = await axios.post(
      combineURLs(getConfig().app.registryUrl, "/lookup"),
      lookupParameter
    );
    const subscribers: Array<SubscriberDetail> = [];
    response.data.forEach((data: object) => {
      try {
        const subscriberData = subscriberDetailsSchema.parse(data);
        subscribers.push(subscriberData);
      } catch (error) {
        // console.log(data);
        // console.log(error);
      }
    });

    lookupCache.cache(lookupParameter, subscribers);
    logger.info(
      `Subscriber list at ${protocolServerLevel}: ${JSON.stringify(
        subscribers
      )}`
    );

    return subscribers;
  } catch (error: any) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Registry_LookupError,
      `Error in registry lookup at ${protocolServerLevel} as ${error.message}`,
      500,
      error
    );
  }
};

export async function getSubscriberDetails(
  subscriber_id: string,
  unique_key_id?: string
) {
  const protocolServerLevel = `${getConfig().app.mode.toUpperCase()}-${getConfig().app.gateway.mode.toUpperCase()}`;
  try {
    const subsribers = await registryLookup({
      subscriber_id: subscriber_id,
      unique_key_id: unique_key_id
    });

    if (subsribers!.length == 0) {
      throw new Exception(
        ExceptionType.Registry_NoSubscriberFound,
        `No subscriber found at ${protocolServerLevel} for payload===> ${JSON.stringify(
          {
            subscriber_id: subscriber_id,
            unique_key_id: unique_key_id
          }
        )}`,
        404
      );
    }

    return subsribers![0];
  } catch (error: any) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Registry_LookupError,
      `Error in registry lookup at ${protocolServerLevel} with error message=>"${error.message}" `,
      500,
      error
    );
  }
}
