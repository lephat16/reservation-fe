import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { StockWithSupplierAndProduct } from "../../stocks/types/stock";
import type { ProductData, ProductDetailDataDTO, ProductFormData } from "../types/product";


export const productAPI = {
    getAllProducts: async (): Promise<ApiResponse<ProductData[]>> => {
        return (await api.get(`/products/info/all`));
    },
    createProduct: async (data: ProductFormData): Promise<ApiResponse<ProductDetailDataDTO>> => {
        return (await api.post(`/products/add`, data));
    },
    getProductInfoDetail: async (productId: number): Promise<ApiResponse<ProductDetailDataDTO>> => {
        return (await api.get(`/products/info-detail/${productId}`));
    },
    updateProduct: async (productData: FormData, productId: number): Promise<ApiResponse<ProductData>> => {      
        return (await api.put(`/products/update/${productId}`, productData));
    },
    deleteProduct: async (productId: number): Promise<ApiResponse<ProductData>> => {
        return (await api.delete(`/products/delete/${productId}`));
    },
    getAllProductsWithInventoryOptional: async (): Promise<ApiResponse<StockWithSupplierAndProduct[]>> => {
        return (await api.get(`/products/all/with-inventory-optional`));
    },


}







