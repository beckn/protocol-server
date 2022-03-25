import { Request, Response } from "express";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { createAuthHeaderConfig } from "../utils/auth";
import { makeBecknRequest, makeRequest_toBG } from "../utils/becknRequester";
import { buildContextForBAP } from "../utils/context";
import { registryLookup, registryLookupForBG } from "../utils/lookup";

export async function triggerHandler(req: Request, res: Response) {
    try {
        // Context Building.
        const context=buildContextForBAP(req.body.context);

        const requestBody={
            context,
            message: req.body.message
        }

        // Validator.

        // Send Response.

        // Auth Creation.
        const axios_config=createAuthHeaderConfig(requestBody)
             
        let response: BecknResponse|undefined;
        
        const bpp_id: string | undefined=context.bpp_id;
        const bpp_uri: string | undefined=context.bpp_uri;

        // In case bpp_id and bpp_uri is present.
        if((bpp_id && bpp_uri) && (bpp_id!=='' && bpp_uri!=='')){
            response=await makeBecknRequest(bpp_uri, requestBody, axios_config);
        }
        else{
            const subscribers=await registryLookup({
                type: 'BG',
                domain: requestBody.context.domain
            });

            response=await makeRequest_toBG(subscribers, requestBody, axios_config);
        }

        if((response.status==200)||(response.status==202)||(response.status==206)){
            // Network Calls Succeeded.
            return;
        }

        // Network Calls Failed.
        // Make call to fail callback url.
    } catch (error) {
        
    }
}