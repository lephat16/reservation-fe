import { useQuery } from "@tanstack/react-query";
import type { SupplierData, SupplierProductData } from "../types/supplier";
import { supplierAPI } from "../api/supplierAPI";



export const useSupplierProductsWithLeadTime = (selectedSupplier: SupplierData | null) => {
    return useQuery<SupplierProductData[]>({
        queryKey: ["supplierProducts", selectedSupplier?.id],
        queryFn: async () => {
            const resProducts = await supplierAPI.getSupplierProductsWithLeadTime(Number(selectedSupplier?.id));
            return resProducts.data?.[0]?.products || [];
        },
        enabled: !!selectedSupplier  // 仕入先が選択されている場合のみ実行
    })
}
