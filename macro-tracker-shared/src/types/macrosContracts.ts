/** Query for macro totals in a date range (`GET /`). */
export interface GetMacrosFromDateRangeRequestQuery {
  fromDate: string;
  toDate: string;
}

export interface MacrosDailyTotals {
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

export type GetMacrosFromDateRangeResponse = MacrosDailyTotals[];

/** Query for “today” macro row (`GET /today`). */
export interface GetTodaysMacrosRequestQuery {
  today?: string;
}

/** `date` mirrors the `today` query param and may be omitted if unbounded. */
export interface GetTodaysMacrosResponse {
  date?: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

export interface MacrosValidationErrorResponse {
  error: string;
}

export interface MacrosServerErrorResponse {
  errorCode: string;
  errorMessage: string;
}
