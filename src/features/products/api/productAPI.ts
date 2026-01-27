import { api } from "../../../api/axiosClient";
import type { ApiResponse} from "../../../shared";
import type { ProductData, ProductDetailDataDTO } from "../types/product";


export const productAPI = {
    getAllProducts: async (): Promise<ApiResponse<ProductData[]>> => {
        return (await api.get(`/products/info/all`));
    },
    
    getProductInfoDetail: async (productId: number): Promise<ApiResponse<ProductDetailDataDTO>> => {
        return (await api.get(`/products/info-detail/${productId}`));
    },
    getProductsByCategory: async (categoryId: number): Promise<ApiResponse<ProductData[]>> => {
        return (await api.get(`/products/all/by-category/${categoryId}`)).data;
    },
    getProductsById: async (productId: number): Promise<ApiResponse<ProductData>> => {
        return (await api.get(`/products/${productId}`)).data;
    },
    updateProduct: async (productData: FormData, productId: number): Promise<ApiResponse<ProductData>> => {
        return (await api.put(`/products/update/${productId}`, productData)).data;
    },
    deleteProduct: async (productId: number): Promise<ApiResponse<ProductData>> => {
        return (await api.delete(`/products/delete/${productId}`)).data;
    },
}


    

    
    
    
