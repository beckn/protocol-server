export enum ExceptionType {
    Cache_NotIntialized = "Cache_NotIntialized",

    Config_NotFound = "Config_NotFound",

    Config_ServerConfig_NotFound = "Config_ServerConfig_NotFound",
    Config_ServerConfig_Invalid = "Config_ServerConfig_Invalid",

    Config_CacheConfig_NotFound = "Config_CacheConfig_NotFound",
    Config_CacheConfig_Invalid = "Config_CacheConfig_Invalid",

    Config_ResponseCacheConfig_Invalid = "Config_ResponseCacheConfig_Invalid",

    Config_ClientConfig_NotFound = "Config_ClientConfig_NotFound",
    Config_ClientConfig_Invalid = "Config_ClientConfig_Invalid",

    Config_SynchronousClientConfig_NotFound = "Config_SynchronousClientConfig_NotFound",
    Config_SynchronousClientConfig_Invalid = "Config_SynchronousClientConfig_Invalid",

    Config_WebhookClientConfig_NotFound = "Config_WebhookClientConfig_NotFound",
    Config_WebhookClientConfig_Invalid = "Config_WebhookClientConfig_Invalid",

    Config_MessageQueueClientConfig_NotFound = "Config_MessageQueueClientConfig_NotFound",
    Config_MessageQueueClientConfig_Invalid = "Config_MessageQueueClientConfig_Invalid",

    Config_GatewayAppConfig_NotFound = "Config_GatewayAppConfig_NotFound",
    Config_GatewayAppConfig_Invalid = "Config_GatewayAppConfig_Invalid",

    Config_ActionConfig_Invalid = "Config_ActionConfig_Invalid",

    Config_ActionsAppConfig_NotFound = "Config_ActionsAppConfig_NotFound",
    Config_ActionsAppConfig_Invalid = "Config_ActionsAppConfig_Invalid",

    Config_AppConfig_NotFound = "Config_AppConfig_NotFound",
    Config_AppConfig_Layer2_Missing = "Config_AppConfig_Layer2_Missing",
    Config_AppConfig_Invalid = "Config_AppConfig_Invalid",

    Config_BPPConfigurationInvalid = "Config_BPPConfigurationInvalid",
    Config_BAPConfigurationInvalid = "Config_BAPConfigurationInvalid",

    Authentication_HeaderParsingFailed = "Authentication_HeaderParsingFailed",

    Context_NotFound = "Context_NotFound",
    Context_DomainNotFound = "Context_DomainNotFound",
    Context_CoreVersionNotFound = "Context_CoreVersionNotFound",
    Context_ActionNotFound = "Context_ActionNotFound",
    Context_TransactionIdNotFound = "Context_TransactionIdNotFound",
    Context_MessageIdNotFound = "Context_MessageIdNotFound",

    Registry_LookupError = "Registry_LookupError",
    Registry_NoSubscriberFound = "Registry_NoSubscriberFound",

    Mongo_URLNotFound = "Mongo_URLNotFound",
    Mongo_ConnectionFailed = "Mongo_ConnectionFailed",
    Mongo_ClientNotInitialized = "Mongo_ClientNotInitialized",

    ResponseCache_NotEnabled = "ResponseCache_NotEnabled",
    ResponseCache_NotInitialized = "ResponseCache_NotInitialized",

    SyncCache_InvalidUse = "SyncCache_InvalidUse",
    SyncCache_NotEnabled = "SyncCache_NotEnabled",
    SyncCache_NotInitialized = "SyncCache_NotInitialized",

    MQ_NotEnabled = "MQ_NotEnabled",
    MQ_ClientNotInitialized = "MQ_ClientNotInitialized",
    MQ_ConnectionFailed = "MQ_ConnectionFailed",

    Gateway_InvalidUse = "Gateway_InvalidUse",

    Client_InvalidCall = "Client_InvalidCall",

    Client_CallbackFailed = "Client_CallbackFailed",
    Client_MessageQueueFailed = "Client_MessageQueueFailed",
    Client_SendSyncReponsesFailed = "Client_SendSyncReponsesFailed",
    Client_SyncCacheDataNotFound = "Client_SyncCacheDataNotFound",

    Acknowledgement_Failed = "Acknowledgement_Failed",

    Request_Failed = "Request_Failed",
    Response_Failed = "Response_Failed",

    OpenApiSchema_ParsingError = "OpenApiSchema_ParsingError",
}

export class Exception extends Error {
    message: string;
    code: number;
    type: ExceptionType;
    errorData?: any;
    constructor(type: ExceptionType, message: string, code: number, errorData?: any) {
        super(`${type}: ${message}\n ${errorData}`);
        this.message = message;
        this.code = code;
        this.type = type;
        this.errorData = errorData;
    }

    toString() {
        return `${this.type}: ${this.message}\n ${this.errorData}`;
    }
}