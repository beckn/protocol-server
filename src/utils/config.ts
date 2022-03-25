const config = require("config");

const loadConfigs : Function = () : void => {
    try {
        const dbString = config.get("db.url");
        // const mqUrl = config.get("mq.url");
        const mode = config.get("app.mode");
        const action = config.get("app.action");
        
        const privateKey = config.get("app.privateKey");
        const publicKey = config.get("app.publicKey");
        
        const protocolId = config.get("app.protocolId");
        const protocolUri = config.get("app.protocolUri");
        
        const registryUrl=config.get("app.registryUrl");
        const uniqueKey = config.get("app.uniqueKey");
        
        const city = config.get("app.city");
        const country= config.get("app.country");
        const ttl=config.get("app.ttl");
        
        const httpTimeout=config.get("app.httpTimeout");
        const httpRetryCount=config.get("app.httpRetryCount");

        const successUrl = config.get("app.callback.successUrl");
        const failureUrl = config.get("app.callback.failureUrl");
        
        process.env = {
            ...process.env,
            dbString,
            // mqUrl,
            mode,
            action,
            privateKey,
            publicKey,
            protocolId,
            protocolUri,
            registryUrl,
            uniqueKey,
            city,
            country,
            ttl,
            httpTimeout,
            httpRetryCount,
            successUrl,
            failureUrl
        }
    } catch (err) {
        throw err
    }
}

export default loadConfigs;