import { Db } from "mongodb";
import { getDb } from "../utils/db";

const responseCacheCollection = 'responseCache';
const emptyPlaceHolder='N/A';

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
        
    }

    public async cacheResponse(responseBody: any) {
        
    }

    public async check(requestBody: any){

    }
}