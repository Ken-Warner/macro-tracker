import { WeighInData } from "@macro-tracker/macro-tracker-shared";
type PostWeighInInput = {
    weight: number;
    date?: string;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbohydrates?: number;
    targetFats?: number;
};
export declare function insertWeighInData(userId: string, weighInData: PostWeighInInput): Promise<void>;
export declare function selectRecentWeighInData(userId: string): Promise<WeighInData | undefined>;
export declare function selectWeighInDataForDateRange(userId: string, fromDate: string, toDate: string): Promise<WeighInData[]>;
export {};
//# sourceMappingURL=weighIn.model.d.ts.map