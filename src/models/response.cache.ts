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

    public async cacheRequest(requestBody: any) {
        const db: Db=getDb();
        const collection=db.collection(responseCacheCollection);

        await this.createExpireIndex();

        const expireDate=new Date(Date.now()+(1000*60*60*24*generalExpiryDays));
        const result=await collection.insertOne({
            expiresAt: expireDate,
            transaction_id: requestBody.transaction_id,
            request: requestBody
        });

        return result.insertedId.toString();
    }

    public async cacheResponse(responseBody: any) {
        const db:Db=getDb();
        const collecton=db.collection(responseCacheCollection);
        
        await this.createExpireIndex();
        
        const requestData=await collecton.findOne({
            transaction_id: responseBody.transaction_id
        });

        if(!requestData){
            return;
        }

        const expireDate=new Date(Date.now()+(1000*60*60*24*generalExpiryDays));
        
        // TODO: insert the respnonseBody inside the responses array.
        // TODO: set the expiration time as per the tll.
        // const result=await collecton.updateOne({
        //     transaction_id: responseBody.transaction_id,
        // }, {
        //     // $addToSet:
        // })
    }

    public async check(requestBody: any){

    }
}