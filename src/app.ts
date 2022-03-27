import loadConfig from './utils/config'
loadConfig();

import Express, { NextFunction, Request, Response } from "express";

import logger from './utils/logger';
import { connectToDb } from "./utils/db";
import router from "./routes/protocol";
import { createKeyPair } from "./utils/auth"

const initializeExpress=async()=>{
    const app = Express()
    app.use(Express.json())

    app.use('/', router)

    app.use((err : any, req : Request, res : Response, next : NextFunction) => {
        res.status(err.status || 500).json({
            message: err.message,
            error: err
        })
    })

    app.listen(process.env.PORT, () => {
        logger.info('Server started on port '+process.env.PORT);
    })
}

const main = async () => {
    try {
        connectToDb()
        createKeyPair();
        initializeExpress();
    } catch (err) {
        logger.error(err)
    }
}

main();