const config = require("config");

const loadConfigs : Function = () : void => {
    try {
        const PORT = config.get("port");
        const dbString = config.get("db.url");
        
        const mode = config.get("app.mode");
        const action = config.get("app.action");
        
        const privateKey = config.get("app.privateKey");
        const publicKey = config.get("app.publicKey");
        
        const subscriberId = config.get("app.subscriberId");
        const subscriberUri = config.get("app.subscriberUri");
        
        const registryUrl=config.get("app.registryUrl");
        const uniqueKey = config.get("app.uniqueKey");
        
        const city = config.get("app.city");
        const country= config.get("app.country");
        
        const ttl=config.get("app.ttl");
        const lookupCacheTTL=config.get("app.lookupCacheTTL");

        const httpTimeout=config.get("app.httpTimeout");
        const httpRetryCount=config.get("app.httpRetryCount");

        const clientUrl=config.get("app.clientUrl");
        
        process.env = {
            ...process.env,
            PORT,
            dbString,
            mode,
            action,
            privateKey,
            publicKey,
            subscriberId,
            subscriberUri,
            registryUrl,
            uniqueKey,
            city,
            country,
            ttl,
            lookupCacheTTL,
            httpTimeout,
            httpRetryCount,
            clientUrl,
        }
    } catch (err) {
        throw err
    }
}

export default loadConfigs;