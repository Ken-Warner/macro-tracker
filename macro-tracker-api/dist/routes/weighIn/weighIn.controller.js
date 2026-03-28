import { insertWeighInData, selectRecentWeighInData, selectWeighInDataForDateRange, } from "../../models/weighIn.model.js";
import validator from "../../Utilities/validator.js";
import { loggingLevels, formatResponse, log } from "../../Utilities/logger.js";
async function getWeighInData(req, res) {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    if (!fromDate || !validator.isValidDate(fromDate)) {
        res.status(400).send(JSON.stringify({
            error: `fromDate must be supplied in the format YYYY-MM-DD`,
        }));
        return;
    }
    if (!toDate || !validator.isValidDate(toDate)) {
        res.status(400).send(JSON.stringify({
            error: `toDate must be supplied in the format YYYY-MM-DD`,
        }));
        return;
    }
    try {
        let weighInData = await selectWeighInDataForDateRange(req.session.userId, fromDate, toDate);
        weighInData = weighInData.map((el) => {
            return {
                date: el.date.toISOString().split("T")[0],
                weight: el.weight,
            };
        });
        const body = weighInData;
        res.status(200).send(JSON.stringify(body));
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `getWeighInData: ${message}`, req.query);
        res.status(500).send(formatResponse(uuid));
    }
}
async function getRecentWeighInData(req, res) {
    try {
        const weighInData = await selectRecentWeighInData(req.session.userId);
        if (weighInData == undefined) {
            return res.status(404).send();
        }
        const apiResult = {
            date: weighInData.date.toISOString().split("T")[0],
            weight: weighInData.weight,
            targetCalories: weighInData.target_calories,
            targetProtein: weighInData.target_protein,
            targetCarbohydrates: weighInData.target_carbohydrates,
            targetFats: weighInData.target_fats,
        };
        res.status(200).send(JSON.stringify(apiResult));
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `getRecentWeighInData: ${message}`, req.body);
        res.status(500).send(formatResponse(uuid));
    }
}
async function postWeighInData(req, res) {
    if (!req.body.weight || !validator.isNumberGEZero(req.body.weight)) {
        res
            .status(400)
            .send(JSON.stringify({ error: `Please provide a valid weight.` }));
        return;
    }
    if (req.body.date && !validator.isValidDate(req.body.date)) {
        res.status(400).send(JSON.stringify({
            error: `Please provide a date in the format YYYY-MM-DD`,
        }));
        return;
    }
    const weighInData = { weight: req.body.weight };
    if (req.body.date) {
        weighInData.date = req.body.date;
    }
    if (req.body.targetCalories !== undefined) {
        weighInData.targetCalories = req.body.targetCalories;
    }
    if (req.body.targetProtein !== undefined) {
        weighInData.targetProtein = req.body.targetProtein;
    }
    if (req.body.targetCarbohydrates !== undefined) {
        weighInData.targetCarbohydrates = req.body.targetCarbohydrates;
    }
    if (req.body.targetFats !== undefined) {
        weighInData.targetFats = req.body.targetFats;
    }
    try {
        await insertWeighInData(req.session.userId, weighInData);
        res.status(200).send();
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `postWeighInData: ${message}`, req.body);
        res.status(500).send(formatResponse(uuid));
    }
}
export { getWeighInData, getRecentWeighInData, postWeighInData };
//# sourceMappingURL=weighIn.controller.js.map