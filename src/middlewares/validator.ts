import * as OpenApiValidator from 'express-openapi-validator'

const validator = OpenApiValidator.middleware({
    apiSpec: "schemas/core.yaml",
    validateRequests: true,
    validateResponses: false,
    $refParser: {
        mode: 'dereference'
    },
})

export default validator
