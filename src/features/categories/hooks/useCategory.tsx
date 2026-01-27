import { useQuery } from "@tanstack/react-query";
import type { CategoryData } from "../types/category";
import { categoryAPI } from "../api/categoryAPI";


export const useCategories = () => {
    return useQuery<CategoryData[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const categoriesData = await categoryAPI.getAllCategories();
            return categoriesData.data || [];
        },
    });
};