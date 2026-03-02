import { useQuery } from "@tanstack/react-query";
import type { CategorySummariesData } from "../types/category";
import { categoryAPI } from "../api/categoryAPI";

/**
 * useCategorySummaries カスタムフック
 *
 * カテゴリのサマリー情報（各カテゴリの概要データ）を取得するための React Query フック
 *
 * 戻り値: useQuery の結果オブジェクト
 * - data: CategorySummariesData[] | undefined
 * - isLoading: データ取得中かどうか
 * - error: エラー情報
 */

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