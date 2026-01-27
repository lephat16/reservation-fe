import { useQuery } from "@tanstack/react-query";
import type { PurchaseOrderData } from "../types/purchase";
import { purchaseAPI } from "../api/purchaseAPI";

export const usePurchaseOrderDetail = (poId: number) => {
    return useQuery<PurchaseOrderData>({
        queryKey: ["purchase-order-detail", poId],
        queryFn: async () => {
            const resPODetail = await purchaseAPI.getPurchaseOrderById(Number(poId));
            return resPODetail.data;
        },
        enabled: !!poId
    })
};