import { LookupParameter, lookupParameterSchema } from "../../schemas/lookupParameter.schema";
import { SubscriberDetail, subscriberDetailsSchema } from "../../schemas/subscriberDetails.schema";
import Moment from 'moment'
import { getConfig } from "../config.utils";
import { RedisClient } from "../redis.utils";
import logger from "../logger.utils";

const emptyPlaceHolder = 'N/A';
const lookupCacheDB = getConfig().cache.db*10+1;

export class LookupCache {
    public static getInstance(): LookupCache {
        if (!LookupCache.instance) {
            LookupCache.instance = new LookupCache();
        }
        return LookupCache.instance;
    }

    private static instance: LookupCache;

    private redisClient: RedisClient;

    private constructor() {
        this.redisClient = new RedisClient(lookupCacheDB);
    }

    public async initialize()  {
        logger.info("Lookup Cache Initialized...");
    }

    private createQueryKey(parameters: LookupParameter): string {
        const queryObj = {
            domain: (parameters.domain) ? parameters.domain : emptyPlaceHolder,
            subscriber_id: (parameters.subscriber_id) ? parameters.subscriber_id : emptyPlaceHolder,
            type: (parameters.type) ? parameters.type : emptyPlaceHolder,
            unique_key_id: (parameters.unique_key_id) ? parameters.unique_key_id : emptyPlaceHolder,
        }

        const queryString = JSON.stringify(queryObj);
        const queryBuffer = Buffer.from(queryString, 'utf-8');
        return queryBuffer.toString('base64url');
    }

    private convertToQuery(queryKey: string): LookupParameter {
        const queryBuffer = Buffer.from(queryKey, 'base64url');
        const queryString = queryBuffer.toString('utf-8');
        const queryObj = lookupParameterSchema.parse(JSON.parse(queryString));
        return queryObj;
    }

    public async cache(parameters: LookupParameter, subscribers: Array<SubscriberDetail>): Promise<boolean> {
        const queryKey = this.createQueryKey(parameters);
        let expireSeconds=getConfig().cache.ttl;
        subscribers.forEach((subscriber: SubscriberDetail) => {
            const validUntillDate=Date.parse(subscriber.valid_until);
            const currExpireSeconds=validUntillDate-Date.now();
            expireSeconds=Math.min(expireSeconds, currExpireSeconds);
        });
        const redisResponse = await this.redisClient.setWithExpiry(queryKey, JSON.stringify(subscribers), expireSeconds);
        return redisResponse;
    }

    public async check(parameters: LookupParameter): Promise<Array<SubscriberDetail> | null> {
        const queryKey = this.createQueryKey(parameters);
        console.log('queryKey :', queryKey);
        const redisResponse = await this.redisClient.get(queryKey);
        
        //bug fix: added validation for redisResponse == '[]'
        if (!redisResponse) {
            return null;
        }

        console.log('queryKey :', queryKey);
        console.log('redisResponse :', redisResponse);

        const subsObjs=JSON.parse(redisResponse as string);
        const subscribers: Array<SubscriberDetail> = [];
        subsObjs.forEach((subObj: object) => {
            try {
                const subscriberData = subscriberDetailsSchema.parse(subObj)
                subscribers.push(subscriberData);
            } catch (error) {
                // console.log(data);
                // console.log(error);
            }
        });

        return subscribers;
    }

    public async clear() : Promise<boolean> {
        const redisResponse = await this.redisClient.flushDB();
        console.log("Lookup Cache Cleared...");
        return redisResponse;
    }
}