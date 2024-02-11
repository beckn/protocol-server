import IORedis from "ioredis";
import { Exception, ExceptionType } from "../models/exception.model";
import { getConfig } from "./config.utils";
import logger from "./logger.utils";

export class RedisClient {
    constructor(db: number = 0, cacheEnabled: boolean = false) {
        this.cacheEnabled = cacheEnabled;
        try {
            this.redis=new IORedis({
                host: getConfig().cache.host,
                port: getConfig().cache.port,
                db: db
            });

            this.cacheEnabled = true;
        } catch (error) {
            throw new Exception(ExceptionType.Cache_NotIntialized, "Cache is not intialized.", 500, error);
        }
        
        logger.info(`Redis Client Connected For DB: ${db}`);
    }

    private cacheEnabled: boolean;
    redis?: IORedis;

    async get(key: string) : Promise<string| null> {
        if(this.cacheEnabled){
            return await this.redis!.get(key);
        }
        else{
            throw new Exception(ExceptionType.Cache_NotIntialized, "Cache is not intialized.", 500);
        }
    }

    async delete(key: string)  : Promise<boolean>{
        if(this.cacheEnabled){
            return await this.redis!.del(key) === 1;
        }
        else{
            throw new Exception(ExceptionType.Cache_NotIntialized, "Cache is not intialized.", 500);
        }
    }

    async set(key: string, value: string) : Promise<boolean> {
        if(this.cacheEnabled){
            return await this.redis!.set(key, value) === "OK";
        }
        else{
            throw new Exception(ExceptionType.Cache_NotIntialized, "Cache is not intialized.", 500);
        }
    }
    
    async setWithExpiry(key: string, value: string, expiry: number) : Promise<boolean> {
        if(this.cacheEnabled){
            return await this.redis!.set(key, value, "EX", expiry) === "OK";
        }
        else{
            throw new Exception(ExceptionType.Cache_NotIntialized, "Cache is not intialized.", 500);
        }
    }

    async flushDB() : Promise<boolean> {
        if(this.cacheEnabled){
            return await this.redis!.flushdb() === "OK";
        }
        else{
            throw new Exception(ExceptionType.Cache_NotIntialized, "Cache is not intialized.", 500);
        }
    }

    getKeys(pattern: string = "*", count = 100) {
        const stream = this.redis?.scanStream({
            match: pattern,
            count: count
        });
        return stream;
    }
}
