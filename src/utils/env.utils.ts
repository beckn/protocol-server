import dotenv from "dotenv";
dotenv.config();
export const getLogsConfig = (): string[] => {
  return JSON.parse(JSON.stringify(process.env.LOG_CONFIG)) || [];
};
