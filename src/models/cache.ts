import { getDb } from "../utils/db";

export const collectionName = 'cacheCollection';

class AppCache {
    id? : string | null
    req? : object | null
    response? : object | null

    async cache() {
        const db = getDb();
        const collection = db.collection(collectionName);
        // todo: add field "expireAt" for expiring the document as per TTL in context of response
        const result = await collection.insertOne(this);
        return result.insertedId;
    }

    async checkCache(req : any) : Promise<AppCache> {
        const db = getDb();
        const collection = db.collection(collectionName);
        const result = await collection.findOne({
            context: {
                domain: req['context']['domain'],
                country: req['context']['country'],
                city: req['context']['city'],
                action: req['context']['action'],
                core_version: req['context']['core_version'],
                bpp_id: req['context']['bpp_id'],
                bpp_uri: req['context']['bpp_uri'],
            }, 
            message: req['message']
        });
        return result;
    }
}