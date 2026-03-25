import { query } from "./pool.js";
async function insertLog(level, message, payload) {
    let insertQuery = {
        text: `INSERT INTO system_logs (message, payload, level)
            VALUES ($1, $2, $3)
            RETURNING uuid;`,
        params: [
            message,
            payload,
            level
        ]
    };
    try {
        const result = await query(insertQuery);
        return result.rows[0].uuid;
    }
    catch (e) {
        return;
    }
}
export { insertLog };
//# sourceMappingURL=systemLogs.model.js.map