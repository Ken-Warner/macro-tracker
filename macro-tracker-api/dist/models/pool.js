import pg from "pg";
const { Pool } = pg;
export const DEFAULT = Symbol("default");
export const pool = new Pool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "test123",
    database: process.env.DB_DATABASE || "postgres",
    port: Number(process.env.DB_PORT) || 5432,
});
export async function query(args) {
    return new Promise((resolve, reject) => {
        if (!args.text) {
            reject({ message: "Invalid query" });
            return;
        }
        const params = args.params ?? [];
        pool.query(args.text, params, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
// Builds field and value lists for INSERT, respecting DEFAULT placeholders.
export function buildInsert(fieldList, valueList) {
    if (fieldList.length !== valueList.length) {
        throw new Error("Parameters and values must be of equal length");
    }
    const queryFields = `(${fieldList.join(",")})`;
    let counter = 0;
    const queryParams = [];
    const queryValueList = valueList.map((element) => {
        if (element === DEFAULT) {
            return "DEFAULT";
        }
        counter += 1;
        queryParams.push(element);
        return `$${String(counter)}`;
    });
    const queryValues = `(${queryValueList.join(",")})`;
    return [queryFields, queryValues, queryParams];
}
//# sourceMappingURL=pool.js.map