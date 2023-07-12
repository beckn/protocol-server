const axiosCall = require('axios').default;
import axios from "axios";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { SubscriberDetail } from "../schemas/subscriberDetails.schema";
import { getConfig } from "./config.utils";
import logger from "./logger.utils";
import { combineURLs } from "./lookup.utils";

export const makeBecknRequest = async (subscriberUrl: string, body: any, axios_config: any, retry_count: number, action: string): Promise<BecknResponse> => {
    try {
        const requestURL = combineURLs(subscriberUrl, `/${action}`);

        const response = await axios.post(requestURL, body, axios_config);

        return {
            data: JSON.stringify(response.data),
            status: response.status
        }
    } catch (error) {
        let response: BecknResponse | undefined;
        if (axios.isAxiosError(error)) {
            response = {
                data: JSON.stringify(error.response?.data),
                status: (error.response?.status) ? error.response?.status : 500
            }
        }
        else {
            response = {
                data: "No Response",
                status: 500
            }
        }

        if (retry_count == 0) {
            return response;
        }

        return await makeBecknRequest(subscriberUrl, body, axios_config, retry_count - 1, action);
    }
}

export async function callNetwork(subscribers: SubscriberDetail[], body: any, axios_config: any, action: string): Promise<BecknResponse> {
    if (subscribers.length == 0) {
        return {
            data: "No Subscribers found",
            status: 500
        }
    }

    for (let i = 0; i < subscribers.length; i++) {
        logger.info(`Attempt Number: ${i + 1} \nAction : ${action}`);
        logger.info(`sending request to BG / BPP: ${subscribers[i].subscriber_url}`);
        logger.info(`Request Body: ${JSON.stringify(body)}`);

        const response = await makeBecknRequest(subscribers[i].subscriber_url, body, axios_config, getConfig().app.httpRetryCount, action);
        if ((response.status == 200) || (response.status == 201) || (response.status == 202) || (response.status == 204)) {
            logger.info(`Result : Request Successful \nStatus: ${response.status} \nData : ${response.data} \nSubscriber URL: ${subscribers[i].subscriber_url}`);
            return response;
        }

        logger.error(`Result : Failed call to Subscriber: ${subscribers[i].subscriber_url}, \nStatus: ${response.status}, \nData: ${response.data}`);
    }

    return {
        data: "No Response",
        status: 500
    }
}