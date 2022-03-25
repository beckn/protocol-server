import axios from 'axios';
import { SubscriberDetail, subscriberDetailsSchema } from '../schemas/subscriberDetails.schema';

export function combineURLs(baseURL: string, relativeURL: string) {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}

const registryLookup=async({
    subscriber_id, unique_key_id, type, domain
}:{
    subscriber_id?: string, unique_key_id?: string, type?: string, domain?: string
})=>{
    try {
        console.log("Looking Up in registry...!")
        const response=await axios.post(combineURLs(process.env.registryUrl!, '/lookup'), { 
            subscriber_id, unique_key_id, type, domain
         });
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

        return subscribers;
    } catch (error) {
        throw error;
    }
}


export async function registryLookupForBG(domain: string, subscriber_id?: string) {
    try {
        if(subscriber_id){
            return await registryLookup({
                subscriber_id,
                type: 'BG'
            });
        }   
    
        return await registryLookup({
            type: 'BG',
            domain:domain
        })
    } catch (error) {
        throw error
    }
}

const compareUrls=(url1:string, url2:string)=>{
    if(url1.length==0){
        if(url2.length==0){
            return true;
        }
        return false;
    }

    if(url1[url1.length-1]=='/'){
        url1=url1.substring(0, url1.length-1);
    }
    if(url2[url2.length-1]=='/'){
        url2=url2.substring(0, url2.length-1);
    }

    return url1==url2;
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

export async function getBppDetails(subscriber_id: string, subscriber_url: string, domain: string) {
    try {
        const subsribers=await registryLookup({
            subscriber_id: subscriber_id,
            type: 'BPP',
            domain: domain
        })

        let requiredSubscriber: SubscriberDetail | undefined;
        subsribers.forEach((info)=>{
            // // TODO: Add this on production.
            // if(!compareUrls(info.subscriber_url, subscriber_url)){
            //     return;
            // }
            requiredSubscriber=info;
        })

        if(!requiredSubscriber){
            throw new Error('BPP not found in the registry...!')
        }

        return requiredSubscriber
    } catch (error) {
        throw error;
    }
}
