import { insertLog } from "../models/systemLogs.model.js";
const loggingLevels = Object.freeze({
    DEBUG: Object.freeze({ name: 'DEBUG', value: 'DEBUG' }),
    INFO: Object.freeze({ name: 'INFO', value: 'INFO' }),
    WARNING: Object.freeze({ name: 'WARNING', value: 'WARNING' }),
    ERROR: Object.freeze({ name: 'ERROR', value: 'ERROR' }),
    FATAL: Object.freeze({ name: 'FATAL', value: 'FATAL' }),
});
async function log(level, message, payload) {
    return await insertLog(level.name, message, JSON.stringify(payload));
}
function formatResponse(errorCode, errorMessage = 'An unexpected error has occured') {
    return JSON.stringify({
        errorCode,
        errorMessage
    });
}
export { loggingLevels, log, formatResponse };
//# sourceMappingURL=logger.js.map