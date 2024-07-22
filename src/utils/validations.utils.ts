import { Request } from "express";
import { createAuthHeaderConfig } from "./auth.utils";
import { makeBecknRequest } from "./becknRequester.utils";
import { getConfig } from "./config.utils";

export const validationFailHandler = async (req: Request, err: any) => {
    const { body = {} } = req;
    const { action } = body.context;
    const axios_config = await createAuthHeaderConfig(body);
    makeBecknRequest(
        body.context?.bap_uri,
        {
            context: {
                ...body.context,
                action: `on_${action}`
            },
            error: {
                code: err.status + '',
                path: err.path,
                message: err.message
            }
        },
        axios_config,
        getConfig().app.httpRetryCount,
        `on_${action}`
    );
}