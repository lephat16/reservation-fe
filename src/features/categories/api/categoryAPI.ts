import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse, ResponseData } from "../../../shared";
import type { CategoryData, CategorySummariesData, CategorySummaryData } from "../types/category";
/**
 * カテゴリーAPI
 *
 * カテゴリーのCRUD操作およびサマリー取得を提供する
 */

export const categoryAPI = {

    /** 新しいカテゴリーを追加する */
    addCategory: async (data: FormData): Promise<ApiResponse<CategoryData>> => {
        return (await api.post(`/categories/add`, data));
    },

    /** 指定IDのカテゴリーを更新する */
    updateCategory: async (categoryId: number, data: FormData): Promise<ApiResponse<CategoryData>> => {
        return (await api.put(`/categories/update/${categoryId}`, data));
    },

    /** すべてのカテゴリー一覧を取得する */
    getAllCategories: async (): Promise<ApiResponse<CategoryData[]>> => {
        return (await api.get(`/categories/all`));
    },

    /** すべてのカテゴリーサマリー一覧を取得する */
    getAllCategorySummaries: async (): Promise<ApiResponse<CategorySummariesData[]>> => {
        return (await api.get(`/categories/summaries`));
    },

    /** 指定IDのカテゴリーサマリーを取得する */
    getCategorySummariesById: async (categoryId: number): Promise<ApiResponse<CategorySummaryData>> => {
        return (await api.get(`/categories/summaries/${categoryId}`));
    },

    /** 指定IDのカテゴリー情報を取得する */
    getCategoryById: async (categoryId: number): Promise<ApiResponse<CategoryData>> => {
        return (await api.get(`/categories/${categoryId}`));
    },

    /** 指定IDのカテゴリーを削除する */

    deleteCategory: async (categoryId: number): Promise<ResponseData> => {
        return (await api.delete(`/categories/delete/${categoryId}`));
    },

}

