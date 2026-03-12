import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { ProductWithSkuByCategoryData, SupplierData, SupplierProductData, SupplierProductFormType, SupplierProductWithCategoryData, SupplierProducWithPriceHistory } from "../types/supplier";

export const supplierAPI = {
    getAllSuppliers: async (): Promise<ApiResponse<SupplierData[]>> => {
        return (await api.get(`/suppliers/all-sup`));
    },
    addSupplier: async (data: SupplierData): Promise<ApiResponse<SupplierData[]>> => {
        return (await api.post(`/suppliers/add-sup`, data));
    },
    addSupplierProduct: async (data: SupplierProductFormType, spId: number): Promise<ApiResponse<SupplierProductData>> => {
        return (await api.post(`/sup-product/${spId}/add-sp`, data));
    },
    getSupplierById: async (supplierId: number): Promise<ApiResponse<SupplierData>> => {
        return (await api.get(`/suppliers/${supplierId}/get-sup`));
    },
    getSupplierProductsWithStock: async (supplierId: Number): Promise<ApiResponse<SupplierProductWithCategoryData[]>> => {
        return (await api.get(`/sup-product/${supplierId}/get-sp-with-stock`));
    },
    getSupplierProductsWithLeadTime: async (supplierId: Number): Promise<ApiResponse<SupplierProductWithCategoryData[]>> => {
        return (await api.get(`/sup-product/${supplierId}/get-sp-with-lead-time`));
    },
    getAllSupllierProductWithSkuByCategory: async (categoryId: Number): Promise<ApiResponse<ProductWithSkuByCategoryData[]>> => {
        return (await api.get(`/products/${categoryId}/with-sku-by-category`));
    },
    getProductsBySkuWithPriceHistory: async (sku: String): Promise<ApiResponse<SupplierProducWithPriceHistory>> => {
        return (await api.get(`/sup-product/${sku}/with-price-history`));
    },
    updateSupplier: async (supplierData: SupplierData, supplierId: number): Promise<ApiResponse<SupplierData>> => {
        return (await api.put(`/suppliers/${supplierId}/update-sup`, supplierData));
    },
    updateSupplierProduct: async (data: SupplierProductFormType, sku: string): Promise<ApiResponse<SupplierProductData>> => {
        return (await api.put(`/sup-product/${sku}`, data));
    },
    deleteSupplier: async (supplierId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/suppliers/${supplierId}/delete-sup`));
    },
    deleteSupplierProductBySku: async (sku: string): Promise<ApiResponse<void>> => {
        return (await api.delete(`/sup-product/${sku}/delete-sp`));
    },
}
