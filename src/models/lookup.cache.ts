import { Db } from "mongodb";
import { LookupParameter } from "../schemas/lookupParameter.schema";
import { SubscriberDetail, subscriberDetailsSchema } from "../schemas/subscriberDetails.schema";
import { getDb } from "../utils/db";
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
                createdAt: 1
            }, {
                expireAfterSeconds: lookupCacheTTL
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

    public async set(parameters: LookupParameter, subscribers: any):Promise<string>{
        const db: Db=getDb();
        const collection=db.collection(lookupCacheCollectionName);
        
        await this.createExpireIndex();

        // TODO: Cache should expire before validUntill
        const result=await collection.insertOne({
            parameters: this.createQuery(parameters),
            subscribers:subscribers,
            createdAt: new Date()
        });

        return result.insertedId.toString();
    }
    
    public async get(parameters: LookupParameter):Promise<Array<SubscriberDetail> | null>{
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
}