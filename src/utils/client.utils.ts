import { ClientConfigType } from "../schemas/configs/client.config.schema";
import { SyncCache } from "./cache/sync.cache.utils";
import { getConfig } from "./config.utils";

export class ClientUtils{
    public static async initializeConnection(){
        const connectionType=getConfig().client.type;
        switch(connectionType){
            case ClientConfigType.synchronous:{
                await SyncCache.getInstance().initialize();
                break;
            }
            case ClientConfigType.webhook:{
                break;
            }
            case ClientConfigType.messageQueue:{
                // TODO: initialize message queue.
                break;
            }
        }
    }
}