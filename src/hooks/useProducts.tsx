import { useQuery } from "@tanstack/react-query";
import type { ProductData } from "../types";
import ApiService from "../services/ApiService";

export const useProducts = () => {
    return useQuery<ProductData[]>({
        queryKey: ["products"],
        queryFn: async () => {
            const productsRes = await ApiService.getAllProducts();
            return productsRes.products || [];
        },
    });
};