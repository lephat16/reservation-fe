import { useQuery } from "@tanstack/react-query";
import type { CategorySummariesData } from "../types/category";
import { categoryAPI } from "../api/categoryAPI";

export const useCategorySummaries = () => {
    return useQuery<CategorySummariesData[]>({
        queryKey: ["category-summaries"],
        queryFn: async () => {
            const categoriesData = await categoryAPI.getAllCategorySummaries();
            return categoriesData.data || [];
        },
        refetchOnWindowFocus: true
    });
};