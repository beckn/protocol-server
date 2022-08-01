import loadConfig, { getConfiguredActions } from './utils/config'
import Express, { NextFunction, Request, Response } from "express";

import logger from './utils/logger';
import { connectToDb } from "./utils/db";

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

    // Routing.
    const router=require('./routes/protocol').default;
    app.use('/', router)

    // Error Handler.
    app.use((err : any, req : Request, res : Response, next : NextFunction) => {
        logger.error(err);
        res.status(err.status || 500).json({
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

    app.listen(process.env.PORT, () => {
        logger.info('Server started on port '+process.env.PORT);
    })
}

const main = async () => {
    try {
        loadConfig();
        await connectToDb()
        // createKeyPair();
        await initializeExpress();
    } catch (err) {
        logger.error(err)
    }
}

main();