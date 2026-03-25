export const loggingLevels: Readonly<{
    DEBUG: Readonly<{
        name: "DEBUG";
        value: "DEBUG";
    }>;
    INFO: Readonly<{
        name: "INFO";
        value: "INFO";
    }>;
    WARNING: Readonly<{
        name: "WARNING";
        value: "WARNING";
    }>;
    ERROR: Readonly<{
        name: "ERROR";
        value: "ERROR";
    }>;
    FATAL: Readonly<{
        name: "FATAL";
        value: "FATAL";
    }>;
}>;
export function log(level: any, message: any, payload: any): Promise<any>;
export function formatResponse(errorCode: any, errorMessage?: string): string;
//# sourceMappingURL=logger.d.ts.map