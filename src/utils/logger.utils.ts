import * as winston from "winston";
import "winston-daily-rotate-file";
import { getLogsConfig } from "./env.utils";

export enum LogLevelEnum {
  HTTP = "http",
  ERROR = "error",
  INFO = "info",
  WARN = "warn",
  DEBUG = "debug"
}

const myFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  }
);

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: winston.format.combine(
    winston.format.label({ label: "test" }),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      level: "info",
      filename: "logs/info/%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      silent: !getLogsConfig().includes("info")
    }),
    new winston.transports.DailyRotateFile({
      level: "error",
      filename: "logs/error/%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      silent: !getLogsConfig().includes("error")
    }),
    new winston.transports.DailyRotateFile({
      level: "warn",
      filename: "logs/warn/%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      silent: !getLogsConfig().includes("warn")
    }),

    new winston.transports.DailyRotateFile({
      level: "http",
      filename: "logs/http/%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      silent: !getLogsConfig().includes("http")
    }),
    new winston.transports.DailyRotateFile({
      level: "debug",
      filename: "logs/debug/%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      silent: !getLogsConfig().includes("debug")
    })
  ]
});

export default logger;
