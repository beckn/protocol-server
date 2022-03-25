const config = require("config");

const loadConfigs : Function = () : void => {
    try {
        const dbString = config.get("db.url");
        const mqUrl = config.get("mq.url");
        const mode = config.get("app.mode");
        const api = config.get("app.api");
        const privateKey = config.get("app.privateKey");
        const publicKey = config.get("app.publicKey");
        const protocolId = config.get("app.protocolId");
        const uniqueKey = config.get("app.uniqueKey");
        const successUrl = config.get("app.callback.successUrl");
        const failureUrl = config.get("app.callback.failureUrl");
        process.env = {
            ...process.env,
            dbString,
            mqUrl,
            mode,
            api,
            privateKey,
            publicKey,
            protocolId,
            uniqueKey,
            successUrl,
            failureUrl
        }
    } catch (err) {
        throw err
    }
}

export default loadConfigs;