import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { StockWithSupplierAndProduct } from "../../stocks/types/stock";
import type { ProductData, ProductDetailDataDTO, ProductFormData } from "../types/product";


export const productAPI = {
    getAllProducts: async (): Promise<ApiResponse<ProductData[]>> => {
        return (await api.get(`/products/info/all-prod`));
    },
    createProduct: async (data: ProductFormData): Promise<ApiResponse<ProductDetailDataDTO>> => {
        return (await api.post(`/products/add-prod`, data));
    },
    getProductInfoDetail: async (productId: number): Promise<ApiResponse<ProductDetailDataDTO>> => {
        return (await api.get(`/products/${productId}/info-detail`));
    },
    updateProduct: async (productData: FormData, productId: number): Promise<ApiResponse<ProductData>> => {      
        return (await api.put(`/products/${productId}/update-prod`, productData));
    },
    deleteProduct: async (productId: number): Promise<ApiResponse<ProductData>> => {
        return (await api.delete(`/products/${productId}/delete-cat`));
    },
    getAllProductsWithInventoryOptional: async (): Promise<ApiResponse<StockWithSupplierAndProduct[]>> => {
        return (await api.get(`/products/all/with-inventory-optional`));
    },


}







