import { useQuery } from "@tanstack/react-query";
import { supplierAPI } from "../api/supplierAPI";
import type { SupplierData, SupplierProductWithCategoryData } from "../types/supplier";


export const useSupplierProductsWithStock = (supplierId: number) => {
    return useQuery<{
        supplierProducts: SupplierProductWithCategoryData[],
        supplier: SupplierData
    }>({
        queryKey: ["supplier", supplierId],
        enabled: !!supplierId,
        queryFn: async () => {
            const [resSupplierProducts, resSupplier] = await Promise.all([
                supplierAPI.getSupplierProductsWithStock(Number(supplierId)),
                supplierAPI.getSupplierById(Number(supplierId)),
            ]);
            return {
                supplierProducts: resSupplierProducts.data ?? [],
                supplier: resSupplier.data ?? null
            };
        }
    })
}
