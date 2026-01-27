import { useQuery } from "@tanstack/react-query";
import type { SaleOrderData } from "../types/sell";
import { saleAPI } from "../api/saleAPI";

export const useSaleOrders = () => {
    return useQuery<SaleOrderData[]>({
        queryKey: ["sale-orders"],
        queryFn: async () => {
            const resSO = await saleAPI.getSaleOrders();
            return resSO.data;
        },
    })
};