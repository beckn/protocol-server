let amqp = require('amqplib/callback_api');
import logger from "./logger";

let ch : any = null


export const establishConnection : Function = async (callback : Function) : Promise<void> => {
    try {
        const url = process.env.mqUrl
        if(!url) {
            throw new Error("MQ url not found")
        }
        amqp.connect(url, (err : any, connection : any) => {
            if(err) {
                throw err
            } else {
                logger.info("MQ connection established")
                connection.createChannel((err1: any, channel : any) => {
                    if(err1) {
                        throw err1
                    }
                    logger.info("MQ channel created")
                    ch = channel
                    channel.assertQueue('errors', {
                        durable: true
                    })
                    const api = process.env.api
                    if(!api) {
                        throw new Error("API not found")
                    }
                    channel.assertQueue(`${api}`, {
                        durable: true
                    })
                    channel.assertQueue(`on_${api}`, {
                        durable: true
                    })
                    listenToQueue()
                })
            }
        })
    } catch (err) {
        throw err
    }
}

export const listenToQueue : Function = async () : Promise<void> => {
    try {
        const api = process.env.api
        if(!api) {
            throw new Error("API not found")
        }
        ch.consume(`on_${api}`, (msg : any) => {
            logger.info(`[x] Received ${msg.content.toString()}`)
            ch.ack(msg)
        }, {
            noAck: false
        })
    } catch (err) {
        throw err
    }
}

export const publishToApiQueue : Function = async (message : object) : Promise<void> => {
    try {
        const api = process.env.api
        if(!api) {
            throw new Error("API not found")
        }
        ch.sendToQueue(`${api}`, new Buffer(JSON.stringify(message)), {
            persistent: true
        })
    } catch (err) {
        throw err
    }
}