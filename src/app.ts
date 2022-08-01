import Express, { NextFunction, Request, Response } from "express"
import { Exception } from "./models/exception.model"
import { RequestActions } from "./schemas/configs/actions.app.config.schema"
import { LookupCache } from "./utils/cache/lookup.cache.utils"
import { RequestCache } from "./utils/cache/request.cache.utils"
import { ResponseCache } from "./utils/cache/response.cache.utils"
import { SyncCache } from "./utils/cache/sync.cache.utils"
import { ClientUtils } from "./utils/client.utils"

import { getConfig } from "./utils/config.utils"
import { GatewayUtils } from "./utils/gateway.utils"
import logger from "./utils/logger.utils"

const app = Express()

app.use(Express.json())

const initializeExpress=async()=>{
    const app = Express()
    
    // Middleware for request body conversion to json and raw body creation.
    app.use(Express.json({
        verify: (req: Request, res: Response, buf: Buffer) => {
            res.locals={
                rawBody: buf.toString()
            }
        }    
    }))

    // Request Logger.
    app.use('/',async (req:Request, res: Response, next: NextFunction) => {
        logger.info(JSON.stringify(req.body));
        next();
    })

    // Test Routes
    const testRouter = require('./routes/test.routes').default;
    app.use('/test', testRouter);

    // Requests Routing.
    const {requestsRouter} = require('./routes/requests.routes');
    app.use('/', requestsRouter);

    // Response Routing.
    const {responsesRouter} = require('./routes/responses.routes');
    app.use('/', responsesRouter);

    // Error Handler.
    app.use((err : Exception, req : Request, res : Response, next : NextFunction) => {
        logger.error(err);
        res.status(err.code || 500).json({
            message: {
                ack:{
                    status: "NACK"
                }
            },
            error: {
                message: err.toString()
            }
        })
    })

    const PORT: number = getConfig().server.port;
    app.listen(PORT, () => {
        logger.info('Protocol Server started on PORT : '+PORT);
    })
}

const main = async () => {
    try {
        console.log(getConfig());

        await ClientUtils.initializeConnection();
        await GatewayUtils.getInstance().initialize();
        if(getConfig().responseCache.enabled){
            await ResponseCache.getInstance().initialize();
        }
        await LookupCache.getInstance().initialize();
        await RequestCache.getInstance().initialize();

        await initializeExpress();
        
    } catch (err) {
        if(err instanceof Exception){
            logger.error(err.toString());
        }
        else{
            logger.error(err);
        }
    }
}

main();