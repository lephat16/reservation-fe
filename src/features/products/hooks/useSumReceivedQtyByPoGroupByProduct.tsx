import { useQuery } from "@tanstack/react-query";
import type { SumReceivedGroupByProduct } from "../types/product";
import { purchaseAPI } from "../../purchases/api/purchaseAPI";
import type { PurchaseOrderData } from "../../purchases/types/purchase";


export const useSumReceivedQtyByPoGroupByProduct = (poId: number, po: PurchaseOrderData | undefined) => {
    return useQuery<SumReceivedGroupByProduct[]>({
        queryKey: ["sum-received-qty-by-po-group-by-product", poId],
        queryFn: async () => {
            const resSumReceivedQty = await purchaseAPI.getSumReceivedQtyByPoGroupByProduct(Number(poId));
            return resSumReceivedQty.data;
        },
        enabled: !!poId && po?.status === 'PROCESSING'
    })
};