import { useQuery } from "@tanstack/react-query";
import { purchaseAPI } from "../api/purchaseAPI";
import type { PurchaseOrderData } from "../types/purchase";

export const usePurchaseOrders = () => {
    return useQuery<PurchaseOrderData[]>({
        queryKey: ["purchase-orders"],
        queryFn: async () => {
            const resPO = await purchaseAPI.getPurchaseOrders();
            return resPO.data;
        },
    })
};