import { useQuery } from "@tanstack/react-query";
import type { SaleOrderData } from "../types/sell";
import { saleAPI } from "../api/saleAPI";

export const useSaleOrderDetail = (soId: number) => {
    return useQuery<SaleOrderData>({
        queryKey: ["sellOrder-detail", soId],
        queryFn: async () => {
            const resPODetail = await saleAPI.getSaleOrderById(soId);
            return resPODetail.data;
        },
        enabled: !!soId
    })
};