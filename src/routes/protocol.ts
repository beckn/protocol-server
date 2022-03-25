import { Router } from "express";
import { bapProtocolHandler } from "../controllers/bap.protocol";
import { bppProtocolHandler } from "../controllers/bpp.protocol";
import { triggerHandler } from "../controllers/trigger";

const router = Router()


if(process.env.mode=='bap'){
    router.post(`/${process.env.api}`, /*buildContextMiddleware, validator*/ triggerHandler);
    
    // TODO: apply schema validator and auth for on_search.
    router.post(`/on_${process.env.api}`, bapProtocolHandler);
}

if(process.env.mode=='bpp'){    
    // TODO: apply schema validator and auth for search.
    router.post(`/${process.env.api}`, bppProtocolHandler)
}

export default router