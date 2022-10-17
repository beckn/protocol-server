import { SubscriberDetail } from "../schemas/subscriberDetails.schema";

export interface Locals {
    sender?: SubscriberDetail;
    rawBody?: any
}