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
  try {
    const lookupCache = LookupCache.getInstance();
    const cachedResponse = await lookupCache.check(lookupParameter);
    if (cachedResponse && cachedResponse!.length > 0) {
      logger.info(`returning response from cache`);
      logger.info(`cachedResponse: ${JSON.stringify(cachedResponse)}`);

      return cachedResponse;
    }

    console.log("\nLooking Up in registry...!\n");
    logger.info(
      `\nLooking Up in registry...!\nWith URL:${combineURLs(
        getConfig().app.registryUrl,
        "/lookup"
      )}\n Payload:${JSON.stringify(lookupParameter)}`
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
    logger.info(`subscribers: ${JSON.stringify(subscribers)}`);

    return subscribers;
  } catch (error: any) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Registry_LookupError,
      "Error in registry lookup",
      500,
      error
    );
  }
};

export async function getSubscriberDetails(
  subscriber_id: string,
  unique_key_id: string
) {
  try {
    const subsribers = await registryLookup({
      subscriber_id: subscriber_id,
      unique_key_id: unique_key_id
    });

    if (subsribers!.length == 0) {
      throw new Exception(
        ExceptionType.Registry_NoSubscriberFound,
        "No subscriber found",
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
      "Error in registry lookup",
      500,
      error
    );
  }
}
