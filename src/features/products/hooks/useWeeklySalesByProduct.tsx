import { useQuery } from "@tanstack/react-query";
import type { WeeklySalesByProduct } from "../../sales/types/sell";
import { saleAPI } from "../../sales/api/saleAPI";


export const useWeeklySalesByProduct = (productId: number) => {
    return useQuery<WeeklySalesByProduct[]>({
        queryKey: ["weekly-sales-product"],
        queryFn: async () => {
            const productsRes = await saleAPI.getWeeklySalesByProduct(productId);
            return productsRes.data || [];
        },
    });
};