import { Db } from "mongodb";
import { LookupParameter } from "../schemas/lookupParameter.schema";
import { SubscriberDetail, subscriberDetailsSchema } from "../schemas/subscriberDetails.schema";
import { getDb } from "./db";
import Moment from 'moment'

const lookupCacheCollectionName = 'lookupCache';
const emptyPlaceHolder='N/A';
const lookupCacheTTL=Moment.duration((process.env.lookupCacheTTL) ? process.env.lookupCacheTTL : 'PT10M').asSeconds();

export class LookupCache{
    public static getInstance():LookupCache{
        if(!LookupCache.instance){
            LookupCache.instance = new LookupCache();
        }
        return LookupCache.instance;
    }

    private static instance:LookupCache;
    
    private async createExpireIndex(){
        // Creating Expire Index.
        const db: Db=getDb();
        const collection=db.collection(lookupCacheCollectionName);

        try {
            const createResult=await collection.createIndex({
                expiresAt: 1
            }, {
                expireAfterSeconds: 0
            });

            // console.log(createResult);
        } catch (error) {
            // console.log("Index is already Set...");
        }
    }
    private constructor(){
    
    }

    private createQuery(parameters:LookupParameter): LookupParameter{
        return {
            domain: (parameters.domain) ? parameters.domain : emptyPlaceHolder,
            subscriber_id: (parameters.subscriber_id) ? parameters.subscriber_id : emptyPlaceHolder,
            type: (parameters.type) ? parameters.type : emptyPlaceHolder,
            unique_key_id: (parameters.unique_key_id) ? parameters.unique_key_id : emptyPlaceHolder,
        }
    }

    public async cache(parameters: LookupParameter, subscribers: Array<SubscriberDetail>):Promise<string>{
        const db: Db=getDb();
        const collection=db.collection(lookupCacheCollectionName);
        
        await this.createExpireIndex();

        let expireDate=(Date.now()+lookupCacheTTL*1000);
        subscribers.forEach((subscriber)=>{
            const validUntillDate=Date.parse(subscriber.valid_until);
            if(validUntillDate<expireDate){
                expireDate=validUntillDate;
            }
        });

        const result=await collection.insertOne({
            parameters: this.createQuery(parameters),
            subscribers:subscribers,
            expiresAt: new Date(expireDate)
        });

        return result.insertedId.toString();
    }
    
    public async check(parameters: LookupParameter):Promise<Array<SubscriberDetail> | null>{
        const db:Db=getDb();
        const collection=db.collection(lookupCacheCollectionName);
        const result=await collection.findOne({
            parameters: this.createQuery(parameters)
        })

        if(result){
            let subscribers:Array<SubscriberDetail>=[];
            result.subscribers.forEach((subscriber:object)=>{
                subscribers.push(subscriberDetailsSchema.parse(subscriber));
            });
            return subscribers; 
        }

        return null;
    }

    public async clear(){
        const db:Db=getDb();
        const collection=db.collection(lookupCacheCollectionName);
        await collection.deleteMany({});
    }
}