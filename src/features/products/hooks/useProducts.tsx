import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { productAPI } from "../api/productAPI";
import type { ProductData } from "../types/product";

export const useProducts = (
    options?: Omit<UseQueryOptions<ProductData[], Error>, "queryKey" | "queryFn">
) => {
    return useQuery<ProductData[], Error>({
        queryKey: ["products"],
        queryFn: async () => {
            const productsRes = await productAPI.getAllProducts();
            return productsRes.data || [];
        },
        ...options,
    });
};