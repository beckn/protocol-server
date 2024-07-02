const { parentPort, workerData } = require('worker_threads');
import { OpenAPIV3 } from 'openapi-types';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
import fs from 'fs';
import serialize from 'serialize-javascript';
import logger from '../utils/logger.utils';
const specFolder = 'schemas';

class SchemaCompilerWorker {
    private ajv: Ajv;
    private specPath: string;

    constructor(specPath: string) {
        this.ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
        addFormats(this.ajv);
        this.specPath = specPath;
    }


    private getApiSpec(specFile: string): OpenAPIV3.Document {
        const apiSpecYAML = fs.readFileSync(specFile, "utf8");
        const apiSpec = YAML.parse(apiSpecYAML);
        return apiSpec;
    };

    async compileSchema() {

        const file = `${specFolder}/${this.specPath}`;
        console.log('Compiling schema worker filename: ', file);
        const options = {
            continueOnError: true, // Continue dereferencing despite errors
        };
        let dereferencedSpec: any;
        dereferencedSpec = await $RefParser.dereference(this.getApiSpec(file), options) as OpenAPIV3.Document;
        //console.log('Derefeer: ');
        
        const schemaCache = new Map<string, any>();
        const regex = /\.(yml|yaml)$/;
        const fileName = this.specPath.split(regex)[0];
        logger.info(`OpenAPIValidator compile schema worker fileName:  ${fileName}`);
        Object.keys(dereferencedSpec.paths).forEach(path => {
            const methods: any = dereferencedSpec.paths[path];
            Object.keys(methods).forEach(method => {
                const operation = methods[method];

                // Compile request body schema
                const requestBodySchema = operation.requestBody && (operation.requestBody as any).content['application/json'].schema;
                if (requestBodySchema) {
                    const key = `${fileName}-${path}-${method}-requestBody`;
                    schemaCache.set(key, this.ajv.compile(requestBodySchema));
                    //console.log('SADDDDSS key : ', key);
                    //console.log('Schema cache worker: ', schemaCache.get(key));
                    
                }

                // Compile query parameters schema
                const queryParameters = (operation.parameters || []).filter((param: any) => param.in === 'query');
                if (queryParameters.length > 0) {
                    const key = `${fileName}-${path}-${method}-queryParameters`;
                    schemaCache.set(key, this.ajv.compile({ type: 'object', properties: queryParameters.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
                        acc[param.name] = param.schema;
                        return acc;
                    }, {} as any) }));
                }

                // Compile headers schema
                const headers = (operation.parameters || []).filter((param: any) => param.in === 'header');
                if (headers.length > 0) {
                    const key = `${fileName}-${path}-${method}-headers`;
                    schemaCache.set(key, this.ajv.compile({ type: 'object', properties: headers.reduce((acc: { [x: string]: any; }, param: { name: string | number; schema: any; }) => {
                        acc[param.name] = param.schema;
                        return acc;
                    }, {} as any) }));
                }
            });
        });
        
        return schemaCache;
    }
}

async function run() {
    const worker = new SchemaCompilerWorker(workerData.specPath);
    try {
        const schemaCache = await worker.compileSchema();
        parentPort?.postMessage(JSON.stringify(Array.from(schemaCache.entries())));
    } catch (error: any) {
        console.log('Hello error: ', error);
        
        parentPort?.postMessage({ error: error.message });
    }
}

run();
