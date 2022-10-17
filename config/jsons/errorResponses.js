const errorResponseJSON={
    "context":{
        domain:"some_domain",
        action: "action",
        message_id: "some_id",
        transaction_id: "some_id",
    },
    "message": {
        ack: {
            status: "NACK",
        },
    },
    "errors":[
        {
            message: "some_message",
            code: "some_code",
            type: "some_type",
            errorData:{}
        },
        {
            message: "some_message",
            code: "some_code",
            type: "some_type",
            errorData:{}
        }
    ]
};