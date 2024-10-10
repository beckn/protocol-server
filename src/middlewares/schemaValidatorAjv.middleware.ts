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
    private schemaCache: Map<string, Function>;
    private initialized: boolean = false;
    private constructor() {
        this.ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
        addFormats(this.ajv);
        this.schemaCache = new Map<string, Function>();
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
        let count = 0;
        let i = 0;
        console.log('Total file: ', fileNames.length);
        
        while(true) {     
            if(count == cachedFileLimit || i >= fileNames.length) {
                break;
            }
            const file = `${specFolder}/${fileNames[i]}`;
            
            const options = {
                continueOnError: true, // Continue dereferencing despite errors
            };
            let dereferencedSpec: any;
            const spec = this.getApiSpec(file);
            if(spec.openapi == '3.1.0') {
                try {
                    dereferencedSpec = await $RefParser.dereference(spec, options) as OpenAPIV3.Document;
                } catch(error) {
                    console.error('Dereferencing error:', error);
                }
                
                try {
                    await this.compileSchemas(dereferencedSpec, fileNames[i]);
                } catch (error) {
                    logger.error(`Error derefencing doc: ${error}`);
                }
                count++;
            }
            i++;

        }
        logger.info(`Schema cache size: ${this.schemaCache.size}`);
        for (const [key, val] of this.schemaCache) {
            logger.info(`Set all cache for validation key and its value : ${key}`);
        }

    }

    async compileSchemas(spec: OpenAPIV3.Document, file: string) {
        const regex = /\.(yml|yaml)$/;
        const fileName = file.split(regex)[0];
        console.log(`OpenAPIValidator compile schema fileName:  ${fileName}`);
    
        for (const path of Object.keys(spec.paths)) {
          const methods: any = spec.paths[path];
    
          for (const method of Object.keys(methods)) {
            const operation = methods[method];
            const key = `${fileName}-${path}-${method}`;
    
            // const miniSchema = {
            //     $schema: "https://json-schema.org/draft/2020-12/schema",
            //     type: "object",
            //     properties: {
            //         requestBody: operation.requestBody?.content['application/json']?.schema, // Only the schema of the requestBody
            //     },
            //     required: operation.requestBody?.required ? ["requestBody"] : [],
            // };
            // const miniSchema: any = {
                
            //     openapi: spec.openapi,
            //     info: spec.info,
            //     paths: {
            //         [path]: {
            //             [method]: operation, // Only keep the specific method for this path
            //         },
            //     }
            // };

            const schema = {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                properties: operation.requestBody?.content['application/json']?.schema ,
                additionalProperties: true,
              }
              const options: ValidatorOptions = {
        
                includeErrors: true, // Include errors in the output
                allErrors: true, // Report all validation errors
                contentValidation: true, // Validate content based on formats,
                //requireSchema: true,
                $schemaDefault: 'http://json-schema.org/draft/2020-12/schema', // Specify the schema version
            };
            if (!this.schemaCache.has(key)) {
              try {
                // Use schemasafe to compile the schema
                // const compiledSchema = validator(miniSchema, {
                //   mode: 'strict',
                //   includeErrors: true
                // });
                const parse = validator(operation.requestBody?.content['application/json']?.schema, options)
                this.schemaCache.set(key, parse);
                console.log(`Schema compiled and cached for ${key}`);
              } catch (error: any) {
                console.error(`Error compiling schema for ${key}: ${error.message}`);
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
      
            // If the value is an object, recursively clean it
            if (typeof value === 'object' && value !== null) {
                this.deleteEmptyKeys(value); 
              // Remove empty objects or arrays
            //   if (Object.keys(value).length === 0 || (Array.isArray(value) && value.length === 0)) {
            //     delete obj[key];
            //   }
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
            console.log('Spec file: ', specFile);
            const regex = /\.(yml|yaml)$/;
            const fileName = specFileName.split(regex)[0];
            console.log('File name: ', specFile);
            const action = `/${req.body.context.action}`;
            const method = req.method.toLowerCase();
            const requestKey = `${fileName}-${action}-${method}`;
            console.log('Has cache: ', requestKey, ' -- ', this.schemaCache.get(requestKey));
            // for (const [key, _] of this.schemaCache) {
            //     logger.info(`Cache key : ${key}`);
            // }
            this.deleteEmptyKeys(req.body);
            if (this.schemaCache.has(requestKey)) {
                console.log(`Schemasafe Validation Cache HIT for ${specFileName}`);
                const validate: any = this.schemaCache.get(requestKey);
                try {
                    const validationResult = validate(req.body);
                    if (!validationResult) {
                        return res.status(400).json({ error: validate.errors });
                    }
                } catch (error) {
                    return res.status(400).json({ error: 'Schema Validation Failed' });
                }
            } else {
                console.log(`Schemasafe Validation Cache miss for ${specFileName}`);
                const apiSpecYAML = this.getApiSpec(specFile);
                const dereferencedSpec = await $RefParser.dereference(apiSpecYAML) as OpenAPIV3.Document;

                try {
                    await this.compileSchemas(dereferencedSpec, specFileName);
                } catch (error) {
                    console.error(`Error compiling doc: ${error}`);
                }

                const validate: any = this.schemaCache.get(requestKey);
                try {
                    const validationResult = validate(req.body);
                    if (!validationResult) {
                        return res.status(400).json({ error: validate.errors });
                    }
                } catch (error) {
                    return res.status(400).json({ error: 'Schema Validation Failed' });
                }
            }

            next();
        };
    }

    // private async compileSchemas(spec: OpenAPIV3.Document, file: string) {
    //     const regex = /\.(yml|yaml)$/;
    //     const fileName = file.split(regex)[0];
    //     logger.info(`OpenAPIValidator compile schema fileName:  ${fileName}`);
    //     Object.keys(spec.paths).forEach(path => {
    //         const methods: any = spec.paths[path];
    //         Object.keys(methods).forEach(method => {
    //             const operation = methods[method];

    //             // Compile request body schema
    //             const bodyKey = `${fileName}-${path}-${method}-requestBody`;
    //             const requestBodySchema = operation.requestBody && (operation.requestBody as any).content['application/json'].schema;
    //             if (!this.schemaCache.has(bodyKey) && requestBodySchema) {
    //                 this.schemaCache.set(bodyKey, this.ajv.compile(requestBodySchema));
    //             }

    //             // Compile query parameters schema
    //             const queryKey = `${fileName}-${path}-${method}-queryParameters`;
    //             const queryParameters = (operation.parameters || []).filter((param: any) => param.in === 'query');
    //             if (!this.schemaCache.has(queryKey) && queryParameters.length) {
    //                 this.schemaCache.set(queryKey, this.ajv.compile({
    //                     type: 'object', properties: queryParameters.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
    //                         acc[param.name] = param.schema;
    //                         return acc;
    //                     }, {} as any)
    //                 }));
    //             }

    //             // Compile headers schema
    //             const headers = (operation.parameters || []).filter((param: any) => param.in === 'header');
    //             const headerKey = `${fileName}-${path}-${method}-headers`;
    //             if (!this.schemaCache.has(headerKey) && headers.length) {
    //                 this.schemaCache.set(headerKey, this.ajv.compile({
    //                     type: 'object', properties: headers.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
    //                         acc[param.name] = param.schema;
    //                         return acc;
    //                     }, {} as any)
    //                 }));
    //             }

    //             // Compile response schema
    //             // const responseSchema = operation.responses && (operation.responses['200'] as any).content['application/json'].schema;
    //             // if (responseSchema) {
    //             //     const key = `${path}-${method}-response`;
    //             //     this.schemaCache.set(key, this.ajv.compile(responseSchema));
    //             // }
    //         });
    //     });
    // }

    // async getValidationMiddleware(specFile: string, specFileName: string) {
    //     return async (req: Request,
    //         res: Response<{}, Locals>,
    //         next: NextFunction) => {
    //         let version = req?.body?.context?.core_version
    //             ? req?.body?.context?.core_version
    //             : req?.body?.context?.version;
    //         let domain = req?.body?.context?.domain;
    //         domain = domain.replace(/:/g, '_');
    //         const formattedVersion = `${domain.trim()}_${version.trim()}`;
    //         logger.info(`Formatted version: ${formattedVersion}`);
    //         const action = `/${req?.body?.context?.action}`;
    //         const method = req.method.toLowerCase();
    //         // Validate request body
    //         const requestBodyKey = `${formattedVersion}-${action}-${method}-requestBody`;
    //         logger.info(`requestBodyKey for incoming req: ${requestBodyKey}`)
    //         if (this.schemaCache.has(requestBodyKey)) {
    //             const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
    //             if (!validateRequestBody(req.body)) {
    //                 return res.status(400).json({ error: validateRequestBody.errors });
    //             }
    //         } else {
    //             logger.info(`AGV Validation Cache miss for ${specFileName} and request body: ${requestBodyKey}`);
    //             const apiSpecYAML = this.getApiSpec(specFile);
    //             const options = {
    //                 continueOnError: true, // Continue dereferencing despite errors
    //             };
    //             let dereferencedSpec: any;
    //             dereferencedSpec = await $RefParser.dereference(apiSpecYAML, options) as OpenAPIV3.Document;
    
    //             try {
    //                 await this.compileSchemas(dereferencedSpec, specFileName);
    //             } catch (error) {
    //                 logger.error(`Error derefencing doc: ${error}`);
    //             }
    //             const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
    //             if (!validateRequestBody(req.body)) {
    //                 return res.status(400).json({ error: validateRequestBody.errors });
    //             }
    //         }

    //         //Validate query parameters
    //         const queryParametersKey = `${formattedVersion}-${action}-${method}-queryParameters`;
    //         if (this.schemaCache.has(queryParametersKey)) {
    //             const validateQueryParameters: any = this.schemaCache.get(queryParametersKey);
    //             if (!validateQueryParameters(req.query)) {
    //                 return res.status(400).json({ error: validateQueryParameters.errors });
    //             }
    //         } else {
    //             logger.info(`AGV Validation Cache miss for ${specFileName} and query-param-key: ${queryParametersKey}`);
    //             const apiSpecYAML = this.getApiSpec(specFile);
    //             const options = {
    //                 continueOnError: true, // Continue dereferencing despite errors
    //             };
    //             let dereferencedSpec: any;
    //             dereferencedSpec = await $RefParser.dereference(apiSpecYAML, options) as OpenAPIV3.Document;   
    //             try {
    //                 await this.compileSchemas(dereferencedSpec, specFileName);
    //             } catch (error) {
    //                 logger.error(`Error derefencing doc: ${error}`);
    //             }
    //             const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
    //             if (!validateRequestBody(req.body)) {
    //                 return res.status(400).json({ error: validateRequestBody.errors });
    //             }
    //         }

    //         // Validate headers
    //         const headersKey = `${formattedVersion}-${action}-${method}-headers`;
    //         if (this.schemaCache.has(headersKey)) {
    //             const validateHeaders: any = this.schemaCache.get(headersKey);
    //             if (!validateHeaders(req.headers)) {
    //                 return res.status(400).json({ error: validateHeaders.errors });
    //             }
    //         } else {
    //             logger.info(`AGV Validation Cache miss for ${specFileName} and header-key: ${headersKey}`);
    //             const apiSpecYAML = this.getApiSpec(specFile);
    //             const options = {
    //                 continueOnError: true, // Continue dereferencing despite errors
    //             };
    //             let dereferencedSpec: any;
    //             dereferencedSpec = await $RefParser.dereference(apiSpecYAML, options) as OpenAPIV3.Document;
    //             try {
    //                 await this.compileSchemas(dereferencedSpec, specFileName);
    //             } catch (error) {
    //                 logger.error(`Error derefencing doc: ${error}`);
    //             }
    //             const validateRequestBody: any = this.schemaCache.get(requestBodyKey);
    //             if (!validateRequestBody(req.body)) {
    //                 return res.status(400).json({ error: validateRequestBody.errors });
    //             }
    //         }
    //         next();
    //     };
    // }
}

