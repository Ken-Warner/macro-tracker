/** Query parameters for listing weigh-ins in a date range (`GET /` weigh-in). */
export interface GetWeighInDataRequestQuery {
    fromDate: string;
    toDate: string;
}
/** Single weigh-in row returned for a date range. */
export interface GetWeighInDataResponseItem {
    date: string;
    weight: number;
}
export type GetWeighInDataResponse = GetWeighInDataResponseItem[];
/** No query or body; the route uses the session only (`GET /recent`). */
export type GetRecentWeighInDataRequest = void;
/** Most recent weigh-in plus macro targets from that row (`GET /recent`). */
export interface GetRecentWeighInDataResponse {
    date: string;
    weight: number;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbohydrates: number | null;
    targetFats: number | null;
}
/** Body for creating or updating a weigh-in (`POST /`). */
export interface PostWeighInDataRequest {
    weight: number;
    date?: string;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbohydrates?: number;
    targetFats?: number;
}
/** Successful POST returns `200` with an empty body. */
export type PostWeighInDataResponse = void;
/** Validation error payload (`400`). */
export interface WeighInValidationErrorResponse {
    error: string;
}
/** Server error payload from `formatResponse` (`500`). */
export interface WeighInServerErrorResponse {
    errorCode: string;
    errorMessage: string;
}
//# sourceMappingURL=weighInContracts.d.ts.map