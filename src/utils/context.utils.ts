import moment from "moment";
import fs from "fs";
import { v4 as uuid_v4 } from "uuid";
import { Exception, ExceptionType } from "../models/exception.model";
import { AppMode } from "../schemas/configs/app.config.schema";
import { ActionUtils } from "./actions.utils";
import { getConfig } from "./config.utils";

export const contextBuilder = async (
  context: any,
  action: string
): Promise<any> => {
  if (!context) {
    throw new Exception(
      ExceptionType.Context_NotFound,
      "Context not found",
      404
    );
  }
  if (!context.domain) {
    throw new Exception(
      ExceptionType.Context_DomainNotFound,
      "Domain not found in the context",
      404
    );
  }
  if (!context.version && !context?.core_version) {
    throw new Exception(
      ExceptionType.Context_CoreVersionNotFound,
      "Core version not found in the context",
      404
    );
  }

  const rawdata: any = await fs.promises.readFile(
    `schemas/context_${context.version?context.version:context.core_version}.json`
  );

  const dynamicContext = Object.entries(JSON.parse(rawdata)).reduce(
    (accum: any, [key, val]: any) => {
      accum[key] = eval(val);
      return accum;
    },
    {
      bap_id: context.bap_id ? context.bap_id : getConfig().app.subscriberId,
      bap_uri: context.bap_uri ? context.bap_uri : getConfig().app.subscriberUri,
      ttl: moment.duration(getConfig().app.ttl, "ms").toISOString(),
      action: ActionUtils.parseAction(context.action),
      timestamp: new Date().toISOString(),
      message_id: uuid_v4(),
      transaction_id: context.transaction_id
        ? context.transaction_id
        : uuid_v4(),
    }
  );
  
  return dynamicContext ;

};

