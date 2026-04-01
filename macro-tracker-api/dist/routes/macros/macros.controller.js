import { selectMacrosFromDateRange, selectTodaysMacros, } from "../../models/macros.model.js";
import validator from "../../Utilities/validator.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
async function getMacrosFromDateRange(req, res) {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    if (!fromDate || !validator.isValidDate(fromDate)) {
        res.status(400).send(JSON.stringify({
            error: `You must provide a fromDate in the format YYYY-MM-DD`,
        }));
        return;
    }
    if (!toDate || !validator.isValidDate(toDate)) {
        res.status(400).send(JSON.stringify({
            error: `You must provide a toDate in the format YYYY-MM-DD`,
        }));
        return;
    }
    try {
        const macroData = await selectMacrosFromDateRange(req.session.userId, fromDate, toDate);
        const body = macroData.map((el) => el.toJSON());
        res.status(200).send(JSON.stringify(body));
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `getMacrosFromDateRange: ${message}`, req.query);
        res.status(500).send(formatResponse(uuid));
    }
}
async function getTodaysMacros(req, res) {
    try {
        const macro = await selectTodaysMacros(req.session.userId, req.query.today);
        const apiResult = {
            calories: macro.calories,
            protein: macro.protein,
            carbohydrates: macro.carbohydrates,
            fats: macro.fats,
        };
        if (req.query.today !== undefined) {
            apiResult.date = req.query.today;
        }
        res.status(200).send(JSON.stringify(apiResult));
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `getTodaysMacros: ${message}`, req.query);
        res.status(500).send(formatResponse(uuid));
    }
}
export { getMacrosFromDateRange, getTodaysMacros };
//# sourceMappingURL=macros.controller.js.map