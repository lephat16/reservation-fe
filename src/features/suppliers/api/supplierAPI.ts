import { api } from "../../../api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { ProductWithSkuByCategoryData, SupplierData, SupplierProductWithCategoryData } from "../types/supplier";

export const supplierAPI = {
    getAllSuppliers: async (): Promise<ApiResponse<SupplierData[]>> => {
        return (await api.get(`/suppliers/all`));
    },
    addSupplier: async (data: SupplierData): Promise<ApiResponse<SupplierData[]>> => {
        return (await api.post(`/suppliers/add`, data));
    },
    getSupplierById: async (supplierId: number): Promise<ApiResponse<SupplierData>> => {
        return (await api.get(`/suppliers/${supplierId}`));
    },
    getSupplierProductsWithStock: async (supplierId: Number): Promise<ApiResponse<SupplierProductWithCategoryData[]>> => {
        return (await api.get(`/sup-product/with-stock/${supplierId}`));
    },
    getSupplierProductsWithLeadTime: async (supplierId: Number): Promise<ApiResponse<SupplierProductWithCategoryData[]>> => {
        return (await api.get(`/sup-product/with-lead-time/${supplierId}`));
    },
    getAllSupllierProductWithSkuByCategory: async (categoryId: Number): Promise<ApiResponse<ProductWithSkuByCategoryData[]>> => {
        return (await api.get(`/products/with-sku-by-category/${categoryId}`));
    },
    deleteSupplier: async (supplierId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/suppliers/delete/${supplierId}`));
    },
}
