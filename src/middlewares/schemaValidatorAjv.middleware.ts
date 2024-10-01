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
const specFolder = 'schemas';
export class Validator {
    private static instance: Validator;
    private ajv: Ajv;
    private schemaCache: Map<string, ValidateFunction>;
    private initialized: boolean = false;
    private constructor() {
        this.ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
        addFormats(this.ajv);
        this.schemaCache = new Map<string, ValidateFunction>();
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
        const cachedFileLimit: number = getConfig().app?.openAPIValidator?.cachedFileLimit || 3;
        logger.info(`OpenAPIValidator Cache count ${cachedFileLimit}`);
        const files = fs.readdirSync(specFolder);
        const fileNames = files.filter(file => fs.lstatSync(path.join(specFolder, file)).isFile() && (file.endsWith('.yaml') || file.endsWith('.yml')));
        logger.info(`OpenAPIValidator loaded spec files ${fileNames}`);
        for (let i = 0; (i < cachedFileLimit && fileNames[i]); i++) {
            const file = `${specFolder}/${fileNames[i]}`;

            const options = {
                continueOnError: true, // Continue dereferencing despite errors
            };
            let dereferencedSpec: any;
            dereferencedSpec = await $RefParser.dereference(this.getApiSpec(file), options) as OpenAPIV3.Document;

            try {
                await this.compileSchemas(dereferencedSpec, fileNames[i]);
            } catch (error) {
                logger.error(`Error derefencing doc: ${error}`);
            }


        }
        logger.info(`Schema cache size: ${this.schemaCache.size}`);
        for (const [key, _] of this.schemaCache) {
            logger.info(`Set all cache for validation key and its value : ${key}`);
        }

    }

    private async compileSchemas(spec: OpenAPIV3.Document, file: string) {
        const regex = /\.(yml|yaml)$/;
        const fileName = file.split(regex)[0];
        logger.info(`OpenAPIValidator compile schema fileName:  ${fileName}`);
        Object.keys(spec.paths).forEach(path => {
            const methods: any = spec.paths[path];
            Object.keys(methods).forEach(method => {
                const operation = methods[method];

                // Compile request body schema
                const bodyKey = `${fileName}-${path}-${method}-requestBody`;
                const requestBodySchema = operation.requestBody && (operation.requestBody as any).content['application/json'].schema;
                if (!this.schemaCache.has(bodyKey) && requestBodySchema) {
                    this.schemaCache.set(bodyKey, this.ajv.compile(requestBodySchema));
                }

                // Compile query parameters schema
                const queryKey = `${fileName}-${path}-${method}-queryParameters`;
                const queryParameters = (operation.parameters || []).filter((param: any) => param.in === 'query');
                if (!this.schemaCache.has(queryKey) && queryParameters.length) {
                    this.schemaCache.set(queryKey, this.ajv.compile({
                        type: 'object', properties: queryParameters.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
                            acc[param.name] = param.schema;
                            return acc;
                        }, {} as any)
                    }));
                }

                // Compile headers schema
                const headers = (operation.parameters || []).filter((param: any) => param.in === 'header');
                const headerKey = `${fileName}-${path}-${method}-headers`;
                if (!this.schemaCache.has(headerKey) && headers.length) {
                    this.schemaCache.set(headerKey, this.ajv.compile({
                        type: 'object', properties: headers.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
                            acc[param.name] = param.schema;
                            return acc;
                        }, {} as any)
                    }));
                }

                // Compile response schema
                // const responseSchema = operation.responses && (operation.responses['200'] as any).content['application/json'].schema;
                // if (responseSchema) {
                //     const key = `${path}-${method}-response`;
                //     this.schemaCache.set(key, this.ajv.compile(responseSchema));
                // }
            });
        });
    }

    async getValidationMiddleware(specFile: string, specFileName: string) {
        return async (req: Request,
            res: Response<{}, Locals>,
            next: NextFunction) => {
            let version = req?.body?.context?.core_version
                ? req?.body?.context?.core_version
                : req?.body?.context?.version;
            let domain = req?.body?.context?.domain;
            domain = domain.replace(/:/g, '_');
            const formattedVersion = `${domain.trim()}_${version.trim()}`;
            logger.info(`Formatted version: ${formattedVersion}`);
            const action = `/${req?.body?.context?.action}`;
            const method = req.method.toLowerCase();
            // Validate request body
            const requestBodyKey = `${formattedVersion}-${action}-${method}-requestBody`;
            logger.info(`requestBodyKey for incoming req: ${requestBodyKey}`)
            if (this.schemaCache.has(requestBodyKey)) {
                const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            } else {
                logger.info(`AGV Validation Cache miss for ${specFileName} and request body: ${requestBodyKey}`);
                const apiSpecYAML = this.getApiSpec(specFile);
                const options = {
                    continueOnError: true, // Continue dereferencing despite errors
                };
                let dereferencedSpec: any;
                dereferencedSpec = await $RefParser.dereference(apiSpecYAML, options) as OpenAPIV3.Document;
    
                try {
                    await this.compileSchemas(dereferencedSpec, specFileName);
                } catch (error) {
                    logger.error(`Error derefencing doc: ${error}`);
                }
                const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            }

            //Validate query parameters
            const queryParametersKey = `${formattedVersion}-${action}-${method}-queryParameters`;
            if (this.schemaCache.has(queryParametersKey)) {
                const validateQueryParameters: any = this.schemaCache.get(queryParametersKey);
                if (!validateQueryParameters(req.query)) {
                    return res.status(400).json({ error: validateQueryParameters.errors });
                }
            } else {
                logger.info(`AGV Validation Cache miss for ${specFileName} and query-param-key: ${queryParametersKey}`);
                const apiSpecYAML = this.getApiSpec(specFile);
                const options = {
                    continueOnError: true, // Continue dereferencing despite errors
                };
                let dereferencedSpec: any;
                dereferencedSpec = await $RefParser.dereference(apiSpecYAML, options) as OpenAPIV3.Document;   
                try {
                    await this.compileSchemas(dereferencedSpec, specFileName);
                } catch (error) {
                    logger.error(`Error derefencing doc: ${error}`);
                }
                const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            }

            // Validate headers
            const headersKey = `${formattedVersion}-${action}-${method}-headers`;
            if (this.schemaCache.has(headersKey)) {
                const validateHeaders: any = this.schemaCache.get(headersKey);
                if (!validateHeaders(req.headers)) {
                    return res.status(400).json({ error: validateHeaders.errors });
                }
            } else {
                logger.info(`AGV Validation Cache miss for ${specFileName} and header-key: ${headersKey}`);
                const apiSpecYAML = this.getApiSpec(specFile);
                const options = {
                    continueOnError: true, // Continue dereferencing despite errors
                };
                let dereferencedSpec: any;
                dereferencedSpec = await $RefParser.dereference(apiSpecYAML, options) as OpenAPIV3.Document;
                try {
                    await this.compileSchemas(dereferencedSpec, specFileName);
                } catch (error) {
                    logger.error(`Error derefencing doc: ${error}`);
                }
                const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            }
            next();
        };
    }
}

