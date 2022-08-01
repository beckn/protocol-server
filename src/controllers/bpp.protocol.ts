import { NextFunction, Request, Response } from "express";
import { Db } from "mongodb";
import { SubscriberDetail } from "../schemas/subscriberDetails.schema";
import { createAuthHeaderConfig } from "../utils/auth";
import { callNetwork } from "../utils/becknRequester";
import { clientCallback } from "../utils/callbacks";
import { ActionTypes, SearchTypes } from "../utils/config";
import { getDb } from "../utils/db";
import { registryLookup } from "../utils/lookup";

const bppRequestCollectionName="bppRequests";

export async function bppProtocolHandler(req: Request, res: Response, next : NextFunction, action: string) {
    try {
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
    } catch (error) {
        next(error)
    }

    // Asynchronous Block.
    try {
        if(action==ActionTypes.search){
            // Checking and saving in the database.
            // In order to decide whether it is a direct search or a broadcast search.
            // We will save it in DB and use it during on_search.
            const gatewayHeader=req.headers['x-gateway-authorization'];
            const db:Db=getDb();

            const bppRequestCollection=db.collection(bppRequestCollectionName);
            const insertResult=await bppRequestCollection.insertOne({
                transactionId: req.body.context.transaction_id,
                gatewayHeader: gatewayHeader,
                action: action,
                searchType: ((gatewayHeader)&&(gatewayHeader!="")) ? SearchTypes.broadcast : SearchTypes.direct,
            });
        }

        clientCallback(req.body, false);
    } catch (error:any) {
        clientCallback({
            context: req.body.context,
            message: {
                ack: {
                    status: "NACK",
                }
            },
            error: {
                message: error.toString()
            }
        },true);
    }
}

export async function publishResults(req : Request, res : Response, next : NextFunction, action: string) {
    req.body.context.bpp_id=process.env.subscriberId;
    req.body.context.bpp_uri=process.env.subscriberUri;
    req.body.context.ttl=process.env.ttl;

    const requestBody=req.body;
    try {
        
        res.status(202).json({
            message: {
                ack: {
                    status: "ACK",
                }
            }
        });
    } catch (error) {
        next(error)
    }

    // Asynchronous Block.
    try {
        const axios_config=await createAuthHeaderConfig(requestBody)

        let subscribers:Array<SubscriberDetail>=[];
        if(action==`on_${ActionTypes.search}`){
            const db:Db=getDb();
            const collection=db.collection(bppRequestCollectionName);

            const bppRequestData=await collection.findOne({
                transactionId: req.body.context.transaction_id,
            });

            if(bppRequestData?.searchType==SearchTypes.broadcast){
                // In this case it is sent back to BG.
                subscribers=await registryLookup({
                    type: 'BG',
                    domain: requestBody.context.domain,
                });
            }
            else{
                subscribers=[{
                    subscriber_id: requestBody.context.bap_id,
                    subscriber_url: requestBody.context.bap_uri,
                    type: 'BAP',
                    signing_public_key: '',
                    valid_until: (new Date(Date.now()+(1000*60*60))).toISOString()
                }];
            }
        }
        else{
            subscribers=[{
                subscriber_id: requestBody.context.bap_id,
                subscriber_url: requestBody.context.bap_uri,
                type: 'BAP',
                signing_public_key: '',
                valid_until: (new Date(Date.now()+(1000*60*60))).toISOString()
            }];
        }

        let response = await callNetwork(subscribers, {
            context: requestBody.context,
            message: requestBody.message,
            error: requestBody.error
        }, axios_config, action);

        if(response.status === 200 || response.status === 202 || response.status === 206){
            return;
        } else {
            await clientCallback({
                context: requestBody.context,
                message: {
                    ack: {
                        status: "NACK",
                    }
                },
                error: {
                    message: 'Error publishing results to BAP.'
                }
            }, true);
        }
    } catch (error:any) {
        await clientCallback({
            context: req.body.context,
            message: {
                ack: {
                    status: "NACK",
                },
            },
            error: { 
                message: error.toString()   
            } 
        }, true);
    }
}