import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse, ResponseData } from "../../../shared";
import type { CategoryData, CategorySummariesData, CategorySummaryData } from "../types/category";
/**
 * カテゴリAPI
 *
 * カテゴリのCRUD操作およびサマリー取得を提供する
 */

export const categoryAPI = {

    /** 新しいカテゴリを追加する */
    addCategory: async (data: FormData): Promise<ApiResponse<CategoryData>> => {
        return (await api.post(`/categories/add-cat`, data));
    },

    /** 指定IDのカテゴリを更新する */
    updateCategory: async (categoryId: number, data: FormData): Promise<ApiResponse<CategoryData>> => {
        return (await api.put(`/categories/${categoryId}/update-cat`, data));
    },

    /** すべてのカテゴリ一覧を取得する */
    getAllCategories: async (): Promise<ApiResponse<CategoryData[]>> => {
        return (await api.get(`/categories/all-cat`));
    },

    /** すべてのカテゴリサマリー一覧を取得する */
    getAllCategorySummaries: async (): Promise<ApiResponse<CategorySummariesData[]>> => {
        return (await api.get(`/categories/summaries`));
    },

    /** 指定IDのカテゴリサマリーを取得する */
    getCategorySummariesById: async (categoryId: number): Promise<ApiResponse<CategorySummaryData>> => {
        return (await api.get(`/categories/${categoryId}/summaries-by-id`));
    },

    /** 指定IDのカテゴリ情報を取得する */
    getCategoryById: async (categoryId: number): Promise<ApiResponse<CategoryData>> => {
        return (await api.get(`/categories/${categoryId}/get-cat`));
    },

    /** 指定IDのカテゴリを削除する */

    deleteCategory: async (categoryId: number): Promise<ResponseData> => {
        return (await api.delete(`/categories/${categoryId}/delete-cat`));
    },

}

