import moment from "moment";
import { getConfig } from "../config.utils";
import { Exception, ExceptionType } from "../../models/exception.model";
import { DBClient } from "../mongo.utils";

const responseCacheCollection = 'response_cache';

export class ResponseCache{
    public static getInstance(): ResponseCache {
        if (!ResponseCache.instance) {
            ResponseCache.instance = new ResponseCache();
        }
        return ResponseCache.instance;
    }

    private static instance: ResponseCache;
    private dbClient: DBClient;

    private constructor() {
        if(!getConfig().responseCache.enabled){
            throw new Exception(ExceptionType.ResponseCache_NotEnabled, "Response cache is not enabled.", 400);
        }
        
        this.dbClient=new DBClient(getConfig().responseCache.mongoURL!);
        this.createExpireIndex();
    }

    public async initialize(){
        if(!getConfig().responseCache.enabled){
            throw new Exception(ExceptionType.ResponseCache_NotEnabled, "Response cache is not enabled.", 400);
        }
        
        if(!this.dbClient.isConnected){
            await this.dbClient.connect();
        }
    }

    private async createExpireIndex(){
        // Creating Expire Index.
        try {
            const collection=this.dbClient.getDB().collection(responseCacheCollection);
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
        if(!getConfig().responseCache.enabled){
            throw new Exception(ExceptionType.ResponseCache_NotEnabled, "Response cache is not enabled.", 400);
        }

        const collection=this.dbClient.getDB().collection(responseCacheCollection);

        await this.createExpireIndex();

        const expireDate=new Date(Date.now()+getConfig().responseCache.ttl!);
        const result=await collection.insertOne({
            expiresAt: expireDate,
            transaction_id: requestBody.context.transaction_id,
            request: requestBody,
            parameters: this.createParameters(requestBody)
        });

        return result.insertedId.toString();
    }

    public async cacheResponse(responseBody: any) {
        if(!getConfig().responseCache.enabled){
            throw new Exception(ExceptionType.ResponseCache_NotEnabled, "Response cache is not enabled.", 400);
        }

        const collecton=this.dbClient.getDB().collection(responseCacheCollection);
        
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
        if(!getConfig().responseCache.enabled){
            throw new Exception(ExceptionType.ResponseCache_NotEnabled, "Response cache is not enabled.", 400);
        }

        const collection=this.dbClient.getDB().collection(responseCacheCollection);

        const requestCursor=collection.find({
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
        if(!getConfig().responseCache.enabled){
            throw new Exception(ExceptionType.ResponseCache_NotEnabled, "Response cache is not enabled.", 400);
        }

        const collection=this.dbClient.getDB().collection(responseCacheCollection);
        await collection.deleteMany({});
    }
}