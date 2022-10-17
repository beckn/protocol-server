import { Db } from "mongodb";
import { Exception, ExceptionType } from "../../models/exception.model";
import { BecknErrorDataType } from "../../schemas/becknError.schema";
import { SyncCacheDataType, syncCacheSchema } from "../../schemas/cache/sync.cache.schema";
import { RequestActions } from "../../schemas/configs/actions.app.config.schema";
import { ClientConfigType, SyncrhonousClientConfigDataType } from "../../schemas/configs/client.config.schema";
import { getConfig } from "../config.utils";
import { DBClient } from "../mongo.utils";

const syncCacheCollectionName = "sync_cache";

export class SyncCache {
    public static getInstance(): SyncCache {
        if (!SyncCache.instance) {
            SyncCache.instance = new SyncCache();
        }

        return SyncCache.instance;
    }

    private static instance: SyncCache;
    private dbClient: DBClient;

    private constructor() {
        if (getConfig().client.type != ClientConfigType.synchronous) {
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        const syncCacheConfig = getConfig().client.connection as SyncrhonousClientConfigDataType;
        this.dbClient = new DBClient(syncCacheConfig.mongoURL);
    }

    public async initialize() {
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }
    }

    public async initCache(message_id: string, action: RequestActions) {
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }

        const collection = this.dbClient.getDB().collection(syncCacheCollectionName);
        await collection.insertOne({
            message_id,
            action,
            created_at: new Date(),
            responses:[]
        });
    }

    public async insertResponse(message_id: string, action: RequestActions, response: any) {
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }

        const collection = this.dbClient.getDB().collection(syncCacheCollectionName);
        await collection.updateOne({
            message_id,
            action
        }, {
            $push: {
                responses: response
            }
        });
    }

    public async recordError(message_id: string, action: RequestActions, error: BecknErrorDataType) {
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }

        const collection = this.dbClient.getDB().collection(syncCacheCollectionName);
        await collection.updateOne({
            message_id,
            action
        }, {
            error: error
        });
    }

    public async getData(message_id: string, action: RequestActions): Promise<SyncCacheDataType|null> {    
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }

        const collection = this.dbClient.getDB().collection(syncCacheCollectionName);
        const result = await collection.findOne({
            message_id,
            action
        });

        if (!result) {
            return null;
        }

        return syncCacheSchema.parse(result);
    }

    public async deleteData(message_id: string, action: RequestActions) {
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }

        const collection = this.dbClient.getDB().collection(syncCacheCollectionName);
        await collection.deleteOne({
            message_id,
            action
        });
    }

    public async clear() {
        if(getConfig().client.type != ClientConfigType.synchronous){
            throw new Exception(ExceptionType.SyncCache_InvalidUse, "Sync Cache should be used only in case the client connection mode is synchronous.", 400);
        }

        if (!this.dbClient.isConnected) {
            await this.dbClient.connect();
        }

        const collection = this.dbClient.getDB().collection(syncCacheCollectionName);
        await collection.deleteMany({});
    }
};