import { useQuery } from "@tanstack/react-query"
import { productAPI } from "../api/productAPI";
import { mapProductDetailResponse } from "../mapper/product.mapper";
import { categoryAPI } from "../../categories/api/categoryAPI";
import type { ProductDetailData } from "../types/product";
import type { CategoryData } from "../../categories/types/category";

export const useProductDetailAndCategories = (productId: number) => {
    return useQuery<{
        productDetail: ProductDetailData;
        categories: CategoryData[];
    }>({
        queryKey: ["product-detail", productId],
        queryFn: async () => {
            const productRes = await productAPI.getProductInfoDetail(Number(productId));
            const productDetail = mapProductDetailResponse(productRes.data);
            const categoryRes = await categoryAPI.getAllCategories();
            const categories = categoryRes.data;
            return {
                productDetail,
                categories,
            };
        },
    })
}

