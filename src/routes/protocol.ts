import { NextFunction, Request, Response, Router } from "express";
import { bapProtocolHandler } from "../controllers/bap.protocol";
import { bppProtocolHandler, publishResults } from "../controllers/bpp.protocol";
import { triggerHandler } from "../controllers/bap.trigger";
import { auth, authCreator } from "../middlewares/auth";
import { contextMiddleware } from "../middlewares/context";
import validator from "../middlewares/validator";
import { ActionTypes, getConfiguredActions, } from "../utils/config";
import { unConfigureActionHandler } from "../controllers/actionHandler";
import { jsonConverter } from "../middlewares/jsonConverter";
import { LookupCache } from "../utils/lookup.cache";
import { ResponseCache } from "../utils/response.cache";


const router = Router()

const configuredActions = getConfiguredActions();
Object.keys(ActionTypes).forEach((action) => {
    let isActionConfigured = false;
    configuredActions.forEach((configuredAction) => {
        if (action == configuredAction) {
            isActionConfigured = true;
        }
    })

    if (isActionConfigured) {
        if (process.env.mode == 'bap') {
            // BAP Trigger
            router.post(`/${action}`, jsonConverter, authCreator, async (req: Request, res: Response, next: NextFunction) => {
                await contextMiddleware(req, res, next, action);
            }, validator, async (req: Request, res: Response, next: NextFunction) => {
                await triggerHandler(req, res, next, action);
            });

            router.post(`/on_${action}`, jsonConverter, validator, auth, async (req: Request, res: Response, next: NextFunction) => {
                await bapProtocolHandler(req, res, next, action);
            });
        }
        else if (process.env.mode == 'bpp') {
            router.post(`/${action}`, jsonConverter, validator, auth, async (req: Request, res: Response, next: NextFunction) => {
                await bppProtocolHandler(req, res, next, action);
            })

            router.post(`/on_${action}`, jsonConverter, authCreator, validator, async (req: Request, res: Response, next: NextFunction) => {
                await publishResults(req, res, next, `on_${action}`);
            })
        }
    }
    else {
        router.post(`/${action}`, (req: Request, res: Response, next: NextFunction) => {
            unConfigureActionHandler(req, res, next, action);
        });

        router.post(`/on_${action}`, (req: Request, res: Response, next: NextFunction) => {
            unConfigureActionHandler(req, res, next, `/on_${action}`);
        });
    }
})

router.delete('/lookupCacbe', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lookupCache = LookupCache.getInstance();
        await lookupCache.clear();
        res.status(200).json({
            result: "Success",
            message: "Lookup Cache Cleared"
        });
    } catch (error) {
        next(error)
    }
});
router.delete('/responseCacbe', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseCache = ResponseCache.getInstance();
        await responseCache.clear();
        res.status(200).json({
            result: "Success",
            message: "Response Cache Cleared"
        });
    } catch (error) {
        next(error);
    }
});

export default router