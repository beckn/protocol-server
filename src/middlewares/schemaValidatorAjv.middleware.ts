import fs from 'fs';
import YAML from 'yaml';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { OpenAPIV3 } from 'openapi-types';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import path from "path";
import logger from '../utils/logger.utils';
import { NextFunction, Request, Response } from 'express';
import { Locals } from "../interfaces/locals.interface";
import { getConfig } from '../utils/config.utils';
import { parser, validator, ValidatorOptions } from '@exodus/schemasafe';
const specFolder = 'schemas';
type SchemaSafeValidator = (data: unknown) => boolean;
export class Validator {
    private static instance: Validator;
    private ajv: Ajv;
    private static schemaCache: {
        [keyName: string]: {
          count: number,
          requestHandler: Function
        }
      } = {};
    private initialized: boolean = false;
    private constructor() {
        this.ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
        addFormats(this.ajv);
        //this.schemaCache = new Map<string, Function>();
    }

    public static getInstance(): Validator {
        if (!Validator.instance) {
            Validator.instance = new Validator();
        }
        return Validator.instance;
    }

    async initialize() {
        if (this.initialized) return;
        console.time('SchemaValidation');
        await this.compileEachSpecFiles();
        console.timeEnd('SchemaValidation');
        this.initialized = true;
    }

    private getApiSpec(specFile: string): OpenAPIV3.Document {
        const apiSpecYAML = fs.readFileSync(specFile, "utf8");
        const apiSpec = YAML.parse(apiSpecYAML);
        return apiSpec;
    };

    async compileEachSpecFiles() {
        const cachedFileLimit: number = getConfig().app?.openAPIValidator?.cachedFileLimit || 7;
        logger.info(`OpenAPIValidator Cache count ${cachedFileLimit}`);
        const files = fs.readdirSync(specFolder);
        const fileNames = files.filter(file => fs.lstatSync(path.join(specFolder, file)).isFile() && (file.endsWith('.yaml') || file.endsWith('.yml')));
        logger.info(`OpenAPIValidator loaded spec files ${fileNames}`);
        let count = 0;
        let i = 0;
        logger.info(`Total file: ${fileNames.length}`);
        
        while (true) {
            if (count == cachedFileLimit || i >= fileNames.length) {
                break;
            }
            const file = `${specFolder}/${fileNames[i]}`;

            const options = {
                continueOnError: true, // Continue dereferencing despite errors
            };
            let dereferencedSpec: any;
            const spec = this.getApiSpec(file);

            try {
                dereferencedSpec = await $RefParser.dereference(spec, options) as OpenAPIV3.Document;
            } catch (error) {
                console.error('Dereferencing error:', error);
            }

            try {
                await this.compileSchemas(dereferencedSpec, fileNames[i]);
            } catch (error) {
                logger.error(`Error derefencing doc: ${error}`);
            }
            count++;

            i++;

        }
        logger.info(`Schema cache size: ${Object.keys(Validator.schemaCache).length}`);
        const cacheStats = Object.entries(Validator.schemaCache).map((cache) => {
            return {
              count: cache[1].count,
              specFile: cache[0]
            }
          });
          console.table(cacheStats);

    }

    async compileSchemas(spec: OpenAPIV3.Document, file: string, schemaPath?: string | null | undefined, schemaMethod?: string | null | undefined) {
        const regex = /\.(yml|yaml)$/;
        const fileName = file.split(regex)[0];
        logger.info(`OpenAPIValidator compile schema fileName:  ${fileName}`);

        for (const path of Object.keys(spec.paths)) {
            const methods: any = spec.paths[path];
            if (!schemaPath || schemaPath === path) {
                for (const method of Object.keys(methods)) {
                    if (!schemaMethod || schemaMethod === method) {
                        const operation = methods[method];
                        const key = `${fileName}-${path}-${method}`;

                        const options: ValidatorOptions = {

                            includeErrors: true, // Include errors in the output
                            allErrors: true, // Report all validation errors
                            contentValidation: true, // Validate content based on formats,
                            //requireSchema: true,
                            $schemaDefault: 'http://json-schema.org/draft/2020-12/schema', // Specify the schema version
                        };
                        if (!Validator.schemaCache[key]) {
                            try {
                                const parse = validator(operation.requestBody?.content['application/json']?.schema, options)
                                Validator.schemaCache[key] = {
                                    count: 0,
                                    requestHandler: parse
                                }
                                logger.info(`Schema compiled and cached for ${key}`);
                            } catch (error: any) {
                                console.error(`Error compiling schema for ${key}: ${error.message}`);
                            }
                        }
                    }
                }
            }
        }

    }

    deleteEmptyKeys(obj: any) {
        // Recursively iterate through the object
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                this.deleteEmptyKeys(value); 
             
            }
            // If the value is undefined or null, delete the key
            else if (value === undefined || value === null) {
              delete obj[key];
            }
          }
        }
        return obj;
      }

    async getValidationMiddleware(specFile: string, specFileName: string) {
        return async (req: any, res: any, next: any) => {
            logger.info(`Spec file:  ${specFile}`);
            const regex = /\.(yml|yaml)$/;
            const fileName = specFileName.split(regex)[0];
            logger.info(`File name: ${specFile}`);
            const action = `/${req.body.context.action}`;
            const method = req.method.toLowerCase();
            const requestKey = `${fileName}-${action}-${method}`;
            this.deleteEmptyKeys(req.body);
            const validateKey = Validator.schemaCache[requestKey];
            if (validateKey) {
                logger.info(`Schemasafe Validation Cache HIT for ${specFileName}`);
                const validate: any = validateKey.requestHandler;
                try {
                    const validationResult = validate(req.body);
                    if (!validationResult) {
                        return res.status(400).json({ error: validate.errors });
                    }
                    validateKey.count = validateKey.count ? validateKey.count + 1 : 1;
                    console.table([{key: requestKey, count: Validator.schemaCache[requestKey].count}]);
                } catch (error) {
                    return res.status(400).json({ error: 'Schema Validation Failed' });
                }
            } else {
                const cashedSpec = Object.entries(Validator.schemaCache);
                let cachedFileLimit: number = getConfig().app?.openAPIValidator?.cachedFileLimit || 7;
                cachedFileLimit = cachedFileLimit * 20;
                if (cashedSpec.length >= cachedFileLimit) {
                    const specWithLeastCount = cashedSpec.reduce((minEntry, currentEntry) => {
                        return currentEntry[1].count < minEntry[1].count ? currentEntry : minEntry;
                    }) || cashedSpec[0];
                    logger.info(`Cache count reached limit. Deleting from cache.... ${specWithLeastCount[0]}`);
                    delete Validator.schemaCache[specWithLeastCount[0]];
                }
                logger.info(`Schemasafe Validation Cache miss for ${specFileName}`);
                const apiSpecYAML = this.getApiSpec(specFile);
                const dereferencedSpec = await $RefParser.dereference(apiSpecYAML) as OpenAPIV3.Document;

                try {
                    await this.compileSchemas(dereferencedSpec, specFileName, action, method);
                    const validateKey = Validator.schemaCache[requestKey];
                    const validate: any = validateKey.requestHandler;
                    const validationResult = validate(req.body);
                    if (!validationResult) {
                        return res.status(400).json({ error: validate.errors });
                    }
                    validateKey.count = validateKey.count ? validateKey.count + 1 : 1;
                } catch (error) {
                    console.error(`Error compiling doc: ${error}`);
                }
            }  
            next();
        };
    }
}

