const config = require("config");

let providedActions: Array<String> = [];

const loadConfigs: Function = (): void => {
    try {
        const PORT = config.get("port");
        const dbString = config.get("db.url");

        const mode = config.get("app.mode");

        providedActions = config.get("app.actions");

        const privateKey = config.get("app.privateKey");
        const publicKey = config.get("app.publicKey");

        const subscriberId = config.get("app.subscriberId");
        const subscriberUri = config.get("app.subscriberUri");

        const registryUrl = config.get("app.registryUrl");
        const auth = config.get("app.auth");
        const uniqueKey = config.get("app.uniqueKey");

        const city = config.get("app.city");
        const country = config.get("app.country");

        const ttl = config.get("app.ttl");
        const lookupCacheTTL = config.get("app.lookupCacheTTL");

        const httpTimeout = config.get("app.httpTimeout");
        const httpRetryCount = config.get("app.httpRetryCount");

        const clientUrl = config.get("app.clientUrl");

        process.env = {
            ...process.env,
            PORT: PORT ? PORT : 3000,
            dbString,
            mode,

            privateKey,
            publicKey,
            subscriberId,
            subscriberUri,
            registryUrl,
            auth,
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

export function getConfiguredActions(): Array<String> {
    return providedActions;
}

export const ActionTypes = {
    search: "search",
    select: "select",
    init: "init",
    confirm: "confirm",
    update: "update",
    status: "status",
    track: "track",
    cancel: "cancel",
    rating: "rating",
    support: "support",
}
export const SearchTypes = {
    broadcast: 'broadcast',
    direct: 'direct',
}

export default loadConfigs;