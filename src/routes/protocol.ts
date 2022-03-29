import { Router } from "express";
import { bapProtocolHandler } from "../controllers/bap.protocol";
import { bppProtocolHandler, publishResults } from "../controllers/bpp.protocol";
import { triggerHandler } from "../controllers/bap.trigger";
import { auth } from "../middlewares/auth";
import { contextMiddleware } from "../middlewares/context";
import validator from "../middlewares/validator";

const router = Router()


if(process.env.mode=='bap'){
    // BAP Trigger
    router.post(`/${process.env.action}`, contextMiddleware, /*validator, */ triggerHandler);
    
    router.post(`/on_${process.env.action}`, validator, auth, bapProtocolHandler);
}

if(process.env.mode=='bpp'){    
    router.post(`/${process.env.action}`,validator, auth, bppProtocolHandler)

    router.post(`/on_${process.env.action}`,validator, auth, publishResults)
}

export default router