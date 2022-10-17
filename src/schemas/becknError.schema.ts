import { z } from "zod";

export enum BecknErrorType {
    contextError="CONTEXT-ERROR", 
    coreError="CORE-ERROR", 
    domainError="DOMAIN-ERROR", 
    policyError="POLICY-ERROR"
}

export const becknErrorSchema=z.object({
    type: z.nativeEnum(BecknErrorType),
    code: z.number(),
    path: z.string().optional(),
    message: z.string(),
    data: z.array(z.any()).optional()
});

export type BecknErrorDataType=z.infer<typeof becknErrorSchema>;