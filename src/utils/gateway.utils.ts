import { bapNetworkResponseSettler } from "../controllers/bap.response.controller";
import { bapClientTriggerSettler } from "../controllers/bap.trigger.controller";
import { bppNetworkRequestSettler } from "../controllers/bpp.request.controller";
import { bppClientResponseSettler } from "../controllers/bpp.response.controller";
import { Exception, ExceptionType } from "../models/exception.model";
import { AppMode } from "../schemas/configs/app.config.schema";
import { GatewayMode } from "../schemas/configs/gateway.app.config.schema";
import { getConfig } from "./config.utils";
import { MQClient } from "./rbtmq.utils";

export class GatewayUtils{
    public static getInstance(){
        if(!GatewayUtils.instance){
            GatewayUtils.instance = new GatewayUtils();
        }
        return GatewayUtils.instance;
    }

    private static instance: GatewayUtils;

    private mqClient: MQClient;

    private constructor(){
        this.mqClient = new MQClient(getConfig().app.gateway.amqpURL);
    }

    public async initialize(){
        await this.mqClient.connect();
        await this.mqClient.assertQueue(getConfig().app.gateway.inboxQueue); 
        await this.mqClient.assertQueue(getConfig().app.gateway.outboxQueue);
        switch(getConfig().app.gateway.mode){
            case GatewayMode.client:{
                switch (getConfig().app.mode) {
                    case AppMode.bap:{
                        await this.mqClient.consumeMessage(getConfig().app.gateway.inboxQueue, bapNetworkResponseSettler);
                        break;
                    }
                    case AppMode.bpp:{
                        await this.mqClient.consumeMessage(getConfig().app.gateway.inboxQueue, bppNetworkRequestSettler);
                    }
                }
                break;
            }
            
            case GatewayMode.network:{
                switch (getConfig().app.mode) {
                    case AppMode.bap:{
                        await this.mqClient.consumeMessage(getConfig().app.gateway.outboxQueue, bapClientTriggerSettler);
                        break;
                    }
                    case AppMode.bpp:{
                        await this.mqClient.consumeMessage(getConfig().app.gateway.outboxQueue, bppClientResponseSettler);
                        break;
                    }
                    break;
                }
            }
        }
    }

    public async sendToClientSideGateway(data: any){
        if(getConfig().app.gateway.mode===GatewayMode.client){
            throw new Exception(ExceptionType.Gateway_InvalidUse, "Gateway is in client mode, cannot send data to client side gateway", 500);
        }

        await this.mqClient.publishMessage(getConfig().app.gateway.inboxQueue, data);
    }

    public async sendToNetworkSideGateway(data: any){
        if(getConfig().app.gateway.mode===GatewayMode.network){
            throw new Exception(ExceptionType.Gateway_InvalidUse, "Gateway is in network mode, cannot send data to network side gateway", 500);
        }
        
        await this.mqClient.publishMessage(getConfig().app.gateway.outboxQueue, data);
    }
}