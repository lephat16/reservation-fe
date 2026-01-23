import { useQuery } from "@tanstack/react-query"
import ApiService from "../services/ApiService";
import type { ProductWithSkuByCategoryData } from "../types/supplier";



const useProductsByCategory = (categoryId: number) => {
    return useQuery<ProductWithSkuByCategoryData[]>({
        queryKey: ["supplierProductsByCategory", categoryId],
        queryFn: async () => {
            if (!categoryId) return [];
            const response = await ApiService.getAllSupllierProductWithSkuByCategory(categoryId);
            return response.data ?? [];
        },
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
        
    });
}

export default useProductsByCategory