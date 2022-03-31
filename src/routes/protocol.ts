import { NextFunction, Request, Response, Router } from "express";
import { bapProtocolHandler } from "../controllers/bap.protocol";
import { bppProtocolHandler, publishResults } from "../controllers/bpp.protocol";
import { triggerHandler } from "../controllers/bap.trigger";
import { auth } from "../middlewares/auth";
import { contextMiddleware } from "../middlewares/context";
import validator from "../middlewares/validator";
import { ActionTypes, getProvidedActions, } from "../utils/config";
import { unConfigureActionHandler } from "../controllers/actionHandler";

const router = Router()

// TODO: comment this.
// if(process.env.mode=='bap'){
//     // // BAP Trigger
//     // router.post(`/${process.env.action}`, contextMiddleware, triggerHandler);
    
//     // // TODO: add auth to it.
//     // router.post(`/on_${process.env.action}`, validator, auth, bapProtocolHandler);
// }

// if(process.env.mode=='bpp'){    
//     // router.post(`/${process.env.action}`,validator, auth, bppProtocolHandler)

//     // router.post(`/on_${process.env.action}`,validator, auth, publishResults)
// }

const configuredActions=getProvidedActions();
Object.keys(ActionTypes).forEach((action)=>{
    let isActionConfigured=false;
    configuredActions.forEach((configuredAction)=>{
        if(action==configuredAction){
            isActionConfigured=true;
        }
    })

    if(isActionConfigured){
        if(process.env.mode=='bap'){
            // BAP Trigger
            router.post(`/${action}`, async (req: Request, res: Response, next: NextFunction) => {
                await contextMiddleware(req, res, next, action);
            }, async (req: Request, res: Response, next: NextFunction) => {
                await triggerHandler(req, res, next, action);
            });
            
            router.post(`/on_${action}`, validator, auth, async (req: Request, res: Response, next: NextFunction) => {
                await bapProtocolHandler(req, res, next, action);
            });
        }
        else if(process.env.mode=='bpp'){    
            router.post(`/${action}`,validator, auth, async (req: Request, res: Response, next: NextFunction) => {
                await bppProtocolHandler(req, res, next, action);
            })
        
            router.post(`/on_${action}`,validator, auth, async (req: Request, res: Response, next: NextFunction) => {
                await publishResults(req, res, next, action);
            })
        }
    }
    else{
        router.post(`/${action}`, (req: Request, res: Response, next: NextFunction) => {
            unConfigureActionHandler(req, res, next, action);
        });
            
        router.post(`/on_${action}`, (req: Request, res: Response, next: NextFunction) => {
            unConfigureActionHandler(req, res, next, action);
        });
    }
})

// Create api for cache clearing for both.

export default router