import pino from "pino";

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
});

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

function log(level, message, payload) {
  const method = levelToMethod[level.name] ?? "info";
  logger[method]({ payload }, message);
}

function formatResponse(errorMessage = "An unexpected error has occured") {
  return JSON.stringify({
    errorMessage,
  });
}

export { loggingLevels, log, formatResponse, logger };
