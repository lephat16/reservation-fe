import { useQuery } from "@tanstack/react-query";
import type { SupplierProducWithPriceHistory } from "../types/supplier";
import { supplierAPI } from "../api/supplierAPI";


export const useSupplierProducWithPriceHistory = (sku: string | null) => {
    return useQuery<SupplierProducWithPriceHistory>({
        queryKey: ["supplier-product-with-price-history", sku],
        queryFn: async () => {
            const resProducts = await supplierAPI.getProductsBySkuWithPriceHistory(sku ?? "");
            return resProducts.data
        },
        enabled: !!sku
    })
}
