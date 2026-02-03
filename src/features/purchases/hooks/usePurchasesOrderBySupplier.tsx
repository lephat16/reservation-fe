import { useQuery } from "@tanstack/react-query";
import type { PurchaseOrderData } from "../types/purchase";
import { purchaseAPI } from "../api/purchaseAPI";

export const usePurchasesOrderBySupplier = (supplierId: number) => {
    return useQuery<PurchaseOrderData[]>({
        queryKey: ["purchase-order-by-supplier", supplierId],
        queryFn: async () => {
            const resPODetail = await purchaseAPI.getPurchaseOrderBySupplier(Number(supplierId));
            return resPODetail.data;
        },
        enabled: !!supplierId
    })
};