import { api } from "../../../api/axiosClient";
import type { ApiResponse, ResponseData } from "../../../shared";
import type { CategoryData, CategorySummariesData, CategorySummaryData } from "../types/category";


export const categoryAPI = {
    getAllCategories: async (): Promise<ApiResponse<CategoryData[]>> => {
        return (await api.get(`/categories/all`));
    },
    getAllCategorySummaries: async (): Promise<ApiResponse<CategorySummariesData[]>> => {
        return (await api.get(`/categories/summaries`));
    },
    getCategorySummariesById: async (categoryId: number): Promise<ApiResponse<CategorySummaryData>> => {
        return (await api.get(`/categories/summaries/${categoryId}`));
    },
    getCategoryById: async (categoryId: number): Promise<ApiResponse<CategoryData>> => {
        return (await api.get(`/categories/${categoryId}`));
    },
    deleteCategory: async (categoryId: number): Promise<ResponseData> => {
        return (await api.delete(`/categories/delete/${categoryId}`)).data;
    },

}

