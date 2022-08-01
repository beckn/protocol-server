import { z } from "zod";

export const contextAcknowledgementSchema=z.object({

});

export type ContextAcknowledgementDataType=z.infer<typeof contextAcknowledgementSchema>;