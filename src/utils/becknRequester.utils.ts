const axiosCall = require("axios").default;
import axios from "axios";
import moment from 'moment';
import { Exception, ExceptionType } from '../models/exception.model';
import { BecknResponse } from "../schemas/becknResponse.schema";
import { SubscriberDetail } from "../schemas/subscriberDetails.schema";
import { getConfig } from "./config.utils";
import logger from "./logger.utils";
import { combineURLs } from "./lookup.utils";

// Add sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const makeBecknRequest = async (
  subscriberUrl: string,
  body: any,
  axios_config: any,
  retry_count: number,
  action: string
): Promise<BecknResponse> => {
  try {
    const requestURL = combineURLs(subscriberUrl, `/${action}`);

    const response = await axios.post(requestURL, body, {
      ...axios_config,
      timeout: 10000
    });

    return {
      data: JSON.stringify(response.data),
      status: response.status
    };
  } catch (error) {
    console.log("Error at Make Beckn Request=====>", error);
    let response: BecknResponse | undefined;
    if (axios.isAxiosError(error)) {
      response = {
        data: JSON.stringify(error.response?.data),
        status: error.response?.status ? error.response?.status : 500
      };
    } else {
      response = {
        data: "No Response",
        status: 500
      };
    }

    if (retry_count === 0 || response.status === 400) {
      return response;
    }
    console.log("Active Retry Attempt=======>====>", retry_count);
    return await makeBecknRequest(
      subscriberUrl,
      body,
      axios_config,
      retry_count - 1,
      action
    );
  }
};

export async function callNetwork(
  subscribers: SubscriberDetail[],
  body: any,
  axios_config: any,
  action: string
): Promise<BecknResponse> {
  if (subscribers.length == 0) {
    return {
      data: "No Subscribers found",
      status: 500
    };
  }

  let lastError;
  for (let i = 0; i < subscribers.length; i++) {
    logger.info(`Attempt Number: ${i + 1} \nAction : ${action}`); 
    logger.info(`sending Response to BAP: ${subscribers[i].subscriber_url}`);
    
    const maxRetries = getConfig().app.httpRetryCount;
    const timeout = moment.duration(getConfig().app.httpTimeout).asMilliseconds();

    // Add retry loop
    for(let retry = 0; retry < maxRetries; retry++) {
      try {
        const response = await axios.post(subscribers[i].subscriber_url, body, {
          ...axios_config,
          timeout: timeout
        });
        
        return {
          data: response.data,
          status: response.status
        };
      } catch (err) {
        lastError = err;
        logger.error(`Request failed, attempt ${retry+1}/${maxRetries}`);
        await sleep(100 * Math.pow(2, retry)); // Exponential backoff
      }
    }
  }

  throw new Exception(
    ExceptionType.Network_RequestFailed, 
    "Network request failed after all retries",
    500,
    lastError
  );
}
