import loadConfig from './utils/config'
loadConfig();

import Express, { NextFunction, Request, Response } from "express";
const app = Express()

import logger from './utils/logger';
import { connectToDb } from "./utils/db";
import router from "./routes/protocol";
import { createKeyPair } from "./utils/auth"

app.use(Express.json())

app.use('/', router)

app.use((err : any, req : Request, res : Response, next : NextFunction) => {
    res.status(err.status || 500).json({
        message: err.message,
        error: err
    })
})

const main = async () => {
    try {
        connectToDb()
        createKeyPair()
        app.listen(3000, () => {
            logger.info('Server started on port 3000');
        })
    } catch (err) {
        logger.error(err)
    }
}

main();