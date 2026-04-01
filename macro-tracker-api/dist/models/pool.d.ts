import pg from "pg";
export declare const DEFAULT: unique symbol;
export declare const pool: import("pg").Pool;
export declare function query(args: {
    text: string;
    params?: unknown[];
}): Promise<pg.QueryResult>;
export declare function buildInsert(fieldList: string[], valueList: Array<unknown | typeof DEFAULT>): [string, string, unknown[]];
//# sourceMappingURL=pool.d.ts.map