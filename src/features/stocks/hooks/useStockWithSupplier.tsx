import { useQuery } from "@tanstack/react-query";
import { categoryAPI } from "../../categories/api/categoryAPI";
import type { StockWithSupplierAndProduct } from "../types/stock";
import type { CategoryData } from "../../categories/types/category";
import { productAPI } from "../../products/api/productAPI";

export const useStockWithSupplier = () => {
    return useQuery<{
        stockProducts: StockWithSupplierAndProduct[];
        categories: CategoryData[];
    }>({
         queryKey: ["stock-with-supplier"],
        queryFn: async () => {
            const resStockProduct = await productAPI.getAllProductsWithInventoryOptional();
            const resCategories = await categoryAPI.getAllCategories();
            return {
                stockProducts: resStockProduct.data,
                categories: resCategories.data
            }

        }
    })
}
