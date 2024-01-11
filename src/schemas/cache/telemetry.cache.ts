export const telemetryEnvelop: any = {
    eid: "API",
    ets: "",
    ver: "1.0",
    mid: "",
    context: {
        channel: "",
        domain: "",
        pdata: {
            id: "",
            uri: ""
        },
        source: {
            id: "",
            type: "",
            uri: ""
        },
        target: {
            id: "",
            type: "",
            uri: ""
        },
        cdata: []
    },
    data: {
        url: "",
        method: "",
        action: "",
        transactionid: "",
        msgid: "",
        exdata: []
    }
}

const telemetryCacheStructure = {
    last_sync_time: new Date().getTime(),
    bap_client_settled: [],
    bap_response_settled: [],
    bpp_client_settled: [],
    bpp_request_settled: [],
}

export const telemetryCache = new Map<string, any>(Object.entries(telemetryCacheStructure));
