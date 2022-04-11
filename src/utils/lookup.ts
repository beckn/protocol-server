import axios from 'axios';
import { LookupParameter } from '../schemas/lookupParameter.schema';
import { SubscriberDetail, subscriberDetailsSchema } from '../schemas/subscriberDetails.schema';
import { LookupCache } from './lookup.cache';

export function combineURLs(baseURL: string, relativeURL: string) {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}

export const registryLookup=async(lookupParameter:LookupParameter)=>{
    try {
        const lookupCache=LookupCache.getInstance();
        const cachedResponse=await lookupCache.check(lookupParameter);
        if(cachedResponse){
            return cachedResponse;
        }

        console.log("\nLooking Up in registry...!\n")
        const response=await axios.post(combineURLs(process.env.registryUrl!, '/lookup'), lookupParameter);
        const subscribers:Array<SubscriberDetail>=[];
        response.data.forEach((data:object) => {
            try {
                const subscriberData=subscriberDetailsSchema.parse(data)
                subscribers.push(subscriberData);
            } catch (error) {
                // console.log(data);
                // console.log(error);
            }
        });

        lookupCache.cache(lookupParameter, subscribers);
        return subscribers;
    } catch (error) {
        throw error;
    }
}

export async function getSubscriberDetails(subscriber_id: string, unique_key_id: string) {
    try {
        const subsribers=await registryLookup({
            subscriber_id: subscriber_id,
            unique_key_id: unique_key_id
        })
    
        if(subsribers.length==0){
            throw Error('No subscribers found...!');
        }
    
        return subsribers[0];
    } catch (error) {
        throw error;
    }
}