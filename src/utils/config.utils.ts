import { Exception, ExceptionType } from "../models/exception.model";
import { ConfigDataType, parseConfig } from "../schemas/configs/config.schema";

const config = require("config");

let configuration: ConfigDataType | null;

export const getConfig = (): ConfigDataType => {
    if (configuration) {
        return configuration;
    }

    configuration = parseConfig(config);
    if(!configuration){
        throw new Exception(ExceptionType.Config_NotFound, "Config file is not found.", 404);
    }

    return configuration!;
}