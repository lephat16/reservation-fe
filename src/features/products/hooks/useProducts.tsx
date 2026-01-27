import { useQuery } from "@tanstack/react-query";
import { productAPI } from "../api/productAPI";
import type { ProductData } from "../types/product";

export const useProducts = () => {
    return useQuery<ProductData[]>({
        queryKey: ["products"],
        queryFn: async () => {
            const productsRes = await productAPI.getAllProducts();
            return productsRes.data || [];
        },
    });
};