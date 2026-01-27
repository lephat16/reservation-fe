import { useQuery } from "@tanstack/react-query"
import { supplierAPI } from "../../suppliers/api/supplierAPI";
import type { ProductWithSkuByCategoryData } from "../../suppliers/types/supplier";



const useProductsByCategory = (categoryId: number) => {
    return useQuery<ProductWithSkuByCategoryData[]>({
        queryKey: ["supplierProductsByCategory", categoryId],
        queryFn: async () => {
            if (!categoryId) return [];
            const response = await supplierAPI.getAllSupllierProductWithSkuByCategory(categoryId);
            return response.data ?? [];
        },
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
        
    });
}

export default useProductsByCategory