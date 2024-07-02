import fs from 'fs';
import YAML from 'yaml';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { OpenAPIV3 } from 'openapi-types';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import path from "path";
import logger from '../utils/logger.utils';
import { NextFunction, Request, Response } from 'express';
import { Worker } from 'worker_threads';
import deserialize from 'serialize-javascript';
import { Locals } from "../interfaces/locals.interface";
const specFolder = 'schemas';
export class Validator {
    private static instance: Validator;
    private ajv: Ajv;
    private schemaCache: Map<string, ValidateFunction>;
    private initialized: boolean = false;
    private shouldRunWorker: boolean = false;
    private constructor() {
        this.ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
        addFormats(this.ajv);
        this.schemaCache = new Map<string, ValidateFunction>();
    }

    public static getInstance(shouldRunWorker: boolean): Validator {
        if (!Validator.instance) {
            Validator.instance = new Validator();
        }
        Validator.instance.shouldRunWorker = shouldRunWorker;
        return Validator.instance;
    }

    async initialize() {
        if (this.initialized) return;
        console.time('SchemaValidation');
        if(this.shouldRunWorker) {
            await this.initializeWorker();
        } else {
            console.log('Running in main thread...');
            await this.compileEachSpecFiles();
        }
        
        console.timeEnd('SchemaValidation');
        this.initialized = true;
    }
    async initializeWorker() {
        console.log('Running in worker thread...');
        const files = fs.readdirSync(specFolder);
        const fileNames = files.filter(file => fs.lstatSync(path.join(specFolder, file)).isFile() && (file.endsWith('.yaml') || file.endsWith('.yml')));
        console.log('File names: ', fileNames);
        // for (const specPath of fileNames) {
        //     const serializedEntries: any = await this.runWorker(specPath);
        //     //console.log('Serialized entries: ', serializedEntries);

        //     let deserializedEntries: any;
        //     try {
        //         deserializedEntries = JSON.parse(serializedEntries);
        //     } catch (error) {
        //         console.error('Error deserializing entries:', error);
        //         continue; // Skip this entry if deserialization fails
        //     }
            
        //     deserializedEntries.forEach(([key, value]: [string, any]) => {
        //         this.schemaCache.set(key, value);
        //     });
        // }
        const workerPromises = fileNames.map(specPath => this.runWorker(specPath));
        let schemaEntries: any = await Promise.all(workerPromises);
        console.log('Schema entries: ', typeof schemaEntries);
        if(typeof schemaEntries == 'string') {
            schemaEntries = JSON.parse(schemaEntries);
        }
        schemaEntries.forEach((entries: any) => {
            let deserializedCache;
            console.log('Enteries type : ', typeof entries);
            if(typeof entries == 'string') {
                console.log('XX');
                logger.info(`Parsing: , ${entries}`);
                deserializedCache = JSON.parse(entries);
            }
            console.log('Decentralized cache type: ', typeof deserializedCache);
            
            deserializedCache.forEach(([key, value]: [string, any]) => {
                this.schemaCache.set(key, value);
            });
        });
    }

    private runWorker(specPath: string): Promise<[string, any][]> {
        return new Promise((resolve, reject) => {
            const worker = new Worker(path.resolve(__dirname, 'schema-compiler-worker.js'), {
                workerData: { 
                    specPath,
                    path: './schema-compiler-worker.ts'
                }
            });

            worker.on('message', (message) => {
                try {
                    // Assuming message is already serialized, directly resolve it
                    resolve(message);
                } catch (error) {
                    reject(error);
                }
            });
    
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }

    private getApiSpec(specFile: string): OpenAPIV3.Document {
        const apiSpecYAML = fs.readFileSync(specFile, "utf8");
        const apiSpec = YAML.parse(apiSpecYAML);
        return apiSpec;
    };

    async compileEachSpecFiles() {
        const cachedFileLimit: number = 20;
        const files = fs.readdirSync(specFolder);
        const fileNames = files.filter(file => fs.lstatSync(path.join(specFolder, file)).isFile() && (file.endsWith('.yaml') || file.endsWith('.yml')));
        logger.info(`OpenAPIValidator loaded spec files ${fileNames}`);
        logger.info(`OpenAPIValidator Cache count ${cachedFileLimit}`);
        for (let i = 0; (i < cachedFileLimit && fileNames[i]); i++) {
            const file = `${specFolder}/${fileNames[i]}`;
            
            const options = {
                continueOnError: true, // Continue dereferencing despite errors
              };
              let dereferencedSpec: any;
              dereferencedSpec = await $RefParser.dereference(this.getApiSpec(file), options) as OpenAPIV3.Document;
              //console.log('Dereferenced spec file: ', JSON.stringify(dereferencedSpec));
              
            try {
                
                await this.compileSchemas(dereferencedSpec, fileNames[i]);
            } catch(error) {
                console.log('Error derefencing doc: ', error);
            }
            //const dereferencedSpec = await $RefParser.dereference(this.getApiSpec(file), options) as OpenAPIV3.Document;
            
            
        }
        console.log('Schema cache size: ', this.schemaCache.size);
        for (const [key, _] of this.schemaCache) {
            //logger.info(`Set all cache for validation key and its value : ${key}`);
            console.log(`Set all cache for validation key and its value : ${key}`);
        }
        
    }

    private async compileSchemas(spec: OpenAPIV3.Document, file: string) {
        //logger.info(`OpenAPIValidator compile schema file:  ${file}`);
        //logger.info(`OpenAPIValidator compile schema specfile:  ${spec}`);
        const regex = /\.(yml|yaml)$/;
        const fileName = file.split(regex)[0];
        logger.info(`OpenAPIValidator compile schema fileName:  ${fileName}`);
        Object.keys(spec.paths).forEach(path => {
            const methods: any = spec.paths[path];
            Object.keys(methods).forEach(method => {
                const operation = methods[method];

                // Compile request body schema
                const requestBodySchema = operation.requestBody && (operation.requestBody as any).content['application/json'].schema;
                if (requestBodySchema) {
                    const key = `${fileName}-${path}-${method}-requestBody`;
                    this.schemaCache.set(key, this.ajv.compile(requestBodySchema));
                }

                // Compile query parameters schema
                const queryParameters = (operation.parameters || []).filter((param: any) => param.in === 'query');
                if (queryParameters.length > 0) {
                    const key = `${fileName}-${path}-${method}-queryParameters`;
                    this.schemaCache.set(key, this.ajv.compile({ type: 'object', properties: queryParameters.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
                        acc[param.name] = param.schema;
                        return acc;
                    }, {} as any) }));
                }

                // Compile headers schema
                const headers = (operation.parameters || []).filter((param: any) => param.in === 'header');
                if (headers.length > 0) {
                    const key = `${fileName}-${path}-${method}-headers`;
                    this.schemaCache.set(key, this.ajv.compile({ type: 'object', properties: headers.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
                        acc[param.name] = param.schema;
                        return acc;
                    }, {} as any) }));
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

    getValidationMiddleware() {
        return (req: Request,
            res: Response<{}, Locals>,
            next: NextFunction) => {
            let version = req?.body?.context?.core_version
                ? req?.body?.context?.core_version
                : req?.body?.context?.version;
            let domain = req?.body?.context?.domain;
            domain = domain.replace(/:/g, '_');
            const formattedVersion = `${domain.trim()}_${version.trim()}`;
            console.log('Formatted version: ', formattedVersion);
            
            const action = `/${req?.body?.context?.action}`;
            const method = req.method.toLowerCase();
            
            // Validate request body
            const requestBodyKey = `${formattedVersion}-${action}-${method}-requestBody`;
            logger.info(`requestBodyKey for incoming req: ${requestBodyKey}`)
            if (this.schemaCache.has(requestBodyKey)) {
                const validateRequestBody: any  = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            } else {
                //compile schema
                //Find the spec file
                //load the spec file
                //parse and destructure the spec file
                //call this.compileSchema(specFile)
                const validateRequestBody: any  = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            }

            // Validate query parameters
            const queryParametersKey = `${formattedVersion}-${action}-${method}-queryParameters`;
            if (this.schemaCache.has(queryParametersKey)) {
                const validateQueryParameters: any = this.schemaCache.get(queryParametersKey);
                if (!validateQueryParameters(req.query)) {
                    return res.status(400).json({ error: validateQueryParameters.errors });
                }
            } else {
                //compile schema
                //Find the spec file
                //load the spec file
                //parse and destructure the spec file
                //call this.compileSchema(specFile)
                const validateRequestBody: any  = this.schemaCache.get(requestBodyKey);
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
                //compile schema
                //Find the spec file
                //load the spec file
                //parse and destructure the spec file
                //call this.compileSchema(specFile)
                const validateRequestBody: any  = this.schemaCache.get(requestBodyKey);
                if (!validateRequestBody(req.body)) {
                    return res.status(400).json({ error: validateRequestBody.errors });
                }
            }

            next();
        };
    }
}


