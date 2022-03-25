import * as OpenApiValidator from 'express-openapi-validator'
// import { OpenApiValidator } from 'express-openapi-validator/dist/openapi.validator'

const validator = OpenApiValidator.middleware({
    apiSpec: "./schemas/core.yaml",
    validateRequests: true,
    validateResponses: false,
})

export default validator