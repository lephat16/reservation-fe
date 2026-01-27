import { useQuery } from "@tanstack/react-query";
import { categoryAPI } from "../api/categoryAPI";
import type { CategoryData, CategorySummaryData } from "../types/category";


export const useInfoCategory = (categoryId: number) => {
    return useQuery<{
        categorySummary: CategorySummaryData,
        categoryInfo: CategoryData
    }>({
        queryKey: ["category"],
        queryFn: async () => {
            const resCategory = await categoryAPI.getCategorySummariesById(categoryId);
            const resCategoryInfo = await categoryAPI.getCategoryById(categoryId);
            return {
                categorySummary: resCategory.data,
                categoryInfo: resCategoryInfo.data,
            }
        }
    });
};