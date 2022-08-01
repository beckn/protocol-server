import { Db, MongoClient } from "mongodb";
import logger from "./logger";

let db : Db | null = null;

export const connectToDb = async () : Promise<void> => {
    try {
        const dbString = process.env.dbString;
        if(!dbString) {
            throw new Error("No database string found in environment variables");
        }
        const client = await MongoClient.connect(
            dbString,
            {
                minPoolSize: 10,
                maxPoolSize: 15,
            }
        )
        await client.connect().then((connection) => {
            db = connection.db();
            logger.info("Connected to database");
        }).catch((error) => {
            throw error
        })
    } catch (err) {
        throw err
    }
}

export const getDb : Function = () : Db => {
    if(!db) {
        throw new Error("No database connection found");
    } else {
        return db;
    }
}