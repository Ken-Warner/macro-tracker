import pino from "pino";

type LoggingLevel = { readonly name: string; readonly value: string };

const loggingLevels = Object.freeze({
  DEBUG: Object.freeze({ name: "DEBUG", value: "DEBUG" }),
  INFO: Object.freeze({ name: "INFO", value: "INFO" }),
  WARNING: Object.freeze({ name: "WARNING", value: "WARNING" }),
  ERROR: Object.freeze({ name: "ERROR", value: "ERROR" }),
  FATAL: Object.freeze({ name: "FATAL", value: "FATAL" }),
});

const levelToMethod = Object.freeze({
  DEBUG: "debug",
  INFO: "info",
  WARNING: "warn",
  ERROR: "error",
  FATAL: "fatal",
} as const);

const isProd = process.env.NODE_ENV === "PROD";

const logger = pino(
  isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      },
);

function log(level: LoggingLevel, message: string, payload?: unknown) {
  const method = levelToMethod[level.name as keyof typeof levelToMethod] ?? "info";
  logger[method]({ payload }, message);
}

function formatResponse(errorMessage = "An unexpected error has occured") {
  return JSON.stringify({
    errorMessage,
  });
}

export { loggingLevels, log, formatResponse, logger };
