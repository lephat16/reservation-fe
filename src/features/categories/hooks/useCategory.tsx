import { useQuery } from "@tanstack/react-query";
import type { CategoryData } from "../types/category";
import { categoryAPI } from "../api/categoryAPI";

/**
 * useCategories カスタムフック
 *
 * 全てのカテゴリデータを取得するための React Query フック
 *
 * 戻り値: useQuery の結果オブジェクト
 * - data: CategoryData[] | undefined
 * - isLoading: データ取得中かどうか
 * - error: エラー情報
 */

export const useCategories = () => {
    return useQuery<CategoryData[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const categoriesData = await categoryAPI.getAllCategories();
            return categoriesData.data || [];
        },
    });
};