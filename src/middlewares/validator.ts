import * as OpenApiValidator from 'express-openapi-validator'

const validator = OpenApiValidator.middleware({
    apiSpec: "schemas/core_correct.yaml",
    validateRequests: true,
    validateResponses: false,
    $refParser: {
        mode: 'dereference'
    },
})

export default validator
