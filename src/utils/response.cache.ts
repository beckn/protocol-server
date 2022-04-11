import moment from "moment";
import { Db } from "mongodb";
import { getDb } from "../utils/db";

const responseCacheCollection = 'responseCache';
const emptyPlaceHolder='N/A';
const generalExpiryDays=1;

export class ResponseCache{
    public static getInstance():ResponseCache{
        if(!ResponseCache.instance){
            ResponseCache.instance = new ResponseCache();
        }
        return ResponseCache.instance;
    }

    private static instance:ResponseCache;
    
    private async createExpireIndex(){
        // Creating Expire Index.
        const db: Db=getDb();
        const collection=db.collection(responseCacheCollection);

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

    private createParameters(requestBody: any){
        const params={
            context:{
                domain: requestBody.context.domain,
                country: requestBody.context.country,
                city: requestBody.context.city,
                action: requestBody.context.action,
                core_version: requestBody.context.core_version
            },
            message:requestBody.message
        }

        return params;
    }

    public async cacheRequest(requestBody: any) {
        const db: Db=getDb();
        const collection=db.collection(responseCacheCollection);

        await this.createExpireIndex();

        const expireDate=new Date(Date.now()+(1000*60*60*24*generalExpiryDays));
        const result=await collection.insertOne({
            expiresAt: expireDate,
            transaction_id: requestBody.context.transaction_id,
            request: requestBody,
            parameters: this.createParameters(requestBody)
        });

        return result.insertedId.toString();
    }

    public async cacheResponse(responseBody: any) {
        const db:Db=getDb();
        const collecton=db.collection(responseCacheCollection);
        
        await this.createExpireIndex();
        
        const requestData=await collecton.findOne({
            transaction_id: responseBody.context.transaction_id
        });

        if(!requestData){
            return;
        }

        const ttlTime=moment.duration(responseBody.context.ttl ?  responseBody.context.ttl : "PT0S").asMilliseconds();
        const expireDate=new Date(Date.now()+ttlTime);
        
        const result=await collecton.updateOne({
            transaction_id: responseBody.context.transaction_id,
        }, {
            $addToSet:{
                responses: responseBody
            },
            $set:{
                expiresAt: expireDate
            }
        })
    }

    public async check(requestBody: any): Promise<Array<any> | null>{
        const db:Db=getDb();
        const collection=db.collection(responseCacheCollection);

        const requestCursor=await collection.find({
            parameters: this.createParameters(requestBody),
        });

        const requestsData=await requestCursor.toArray();
        for(let i=0; i<requestsData.length; i++){
            if(requestsData[i]?.responses?.length>0){
                return requestsData[i].responses;
            }
        }

        return null;
    }

    public async clear(){
        const db:Db=getDb();
        const collection=db.collection(responseCacheCollection);
        await collection.deleteMany({});
    }
}