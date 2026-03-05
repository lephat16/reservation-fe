import { useQuery } from "@tanstack/react-query";
import type { StockDataBySku } from "../types/stock";
import { stockAPI } from "../api/stockAPI";

export const useStockBySku = (sku: string | null) => {
    return useQuery<StockDataBySku[]>({
        queryKey: ["stocks-by-sku", sku],
        queryFn: async () => {
            if (!sku) return [];
            const resStockBySku = await stockAPI.getStocksBySku(sku);
            return resStockBySku.data
        },
        enabled: !!sku
    })
}