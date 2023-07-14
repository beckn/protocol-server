import { response, Response } from "express";
import { Exception, ExceptionType } from "../models/exception.model";
import {
  BecknErrorDataType,
  becknErrorSchema
} from "../schemas/becknError.schema";
import logger from "./logger.utils";

function acknowledge(res: Response, data: any) {
  try {
    res.status(202).json(data);
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Acknowledgement_Failed,
      "Acknowledge to client connection failed",
      500,
      error
    );
  }
}

export function acknowledgeACK(res: Response, context: any) {
  try {
    const contextData = JSON.parse(JSON.stringify(context));
    acknowledge(res, {
      context: contextData,
      message: {
        ack: {
          status: "ACK"
        }
      }
    });
  } catch (error) {
    if (error instanceof Exception) {
      logger.error(error);
      throw error;
    }

    throw new Exception(
      ExceptionType.Acknowledgement_Failed,
      "Acknowledge to client connection failed",
      500,
      error
    );
  }
}

export function acknowledgeNACK(
  res: Response,
  context: any,
  error: BecknErrorDataType
) {
  try {
    const errorData = becknErrorSchema.parse(error);
    const contextData = JSON.parse(JSON.stringify(context));
    acknowledge(res, {
      context: contextData,
      message: {
        ack: {
          status: "NACK"
        }
      },
      error: errorData
    });
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    throw new Exception(
      ExceptionType.Acknowledgement_Failed,
      "Acknowledge to client connection failed",
      500,
      error
    );
  }
}
