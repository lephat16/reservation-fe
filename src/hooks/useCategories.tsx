import { useQuery } from "@tanstack/react-query";
import type { CategoryData } from "../types";
import ApiService from "../services/ApiService";


export const useCategories = () => {
    return useQuery<CategoryData[]>({
        queryKey: ["products"],
        queryFn: async () => {
            const categoriesData = await ApiService.getAllCategories();
            return categoriesData.categories || [];
        },
    });
};