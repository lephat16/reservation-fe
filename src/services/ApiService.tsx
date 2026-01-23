import CryptoJS from "crypto-js";
import type { AllUserRespose, ApiResponse, CategoryData, CategorySummariesData, CategorySummaryData, DashboardDTO, DeliverStockItem, InventoryHistoryByPurchaseOrder, InventoryHistoryBySaleOrder, LoginRequest, LoginResponse, ProductData, ProductDetailData, PurchaseOrderData, PurchaseOrderItem, ReceiveStockItem, StockResultData, RegisterRequest, RegisterResponse, ResponseData, SaleOrderData, SellData, SumReceivedGroupByProduct, TransactionsResponse, UserData, WarehouseWithLocationData, SellOrderItem, } from "../types";
import { api } from "../api/axiosClient";
import type { ProductWithSkuByCategoryData, SupplierData, SupplierProductWithCategoryData } from "../types/supplier";
import type { StockHistoriesWithDetailData, WarehouseFormData, WarehousesData, WarehouseWithTotalChangedQtyData } from "../types/warehouse";
import type { StockWithSupplierAndProduct } from "../types/stock";
export default class ApiService {
    static ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
    static encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
    }
    static decrypt(data: string): string {
        const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    static saveToken(token: string): void {
        const encryptToken = this.encrypt(token);
        localStorage.setItem("token", encryptToken);
    }
    static getToken(): string | null {
        const encryptedToken = localStorage.getItem("token");
        if (!encryptedToken) return null;
        return this.decrypt(encryptedToken);
    }
    static saveRefreshToken(refreshToken: string): void {
        const encryptRefreshToken = this.encrypt(refreshToken);
        localStorage.setItem("refreshToken", encryptRefreshToken);
    }
    static getRefreshToken(): string | null {
        const encryptedRefreshToken = localStorage.getItem("refreshToken");
        if (!encryptedRefreshToken) return null;
        return this.decrypt(encryptedRefreshToken);
    }
    static saveRole(role: string): void {
        const encryptRole = this.encrypt(role);
        localStorage.setItem("role", encryptRole);
    }
    static getRole(): string | null {
        const encryptedRole = localStorage.getItem("role");
        if (!encryptedRole) return null;
        return this.decrypt(encryptedRole);
    }
    static clearAuth(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }


    static async registerUser(registerData: RegisterRequest): Promise<RegisterResponse> {
        return (await api.post(`/auth/register`, registerData)).data;
    }
    static async loginUser(loginUser: LoginRequest): Promise<LoginResponse> {
        return (await api.post(`/auth/login`, loginUser)).data;
    }
    static async getAllUsers(): Promise<AllUserRespose> {
        return (await api.get(`/users/all`)).data;
    }
    static async getLoggedInUser(): Promise<ApiResponse<UserData>> {
        return ((await api.get(`/users/current`)));
    }
    static async getUserById(userId: number): Promise<UserData> {
        return (await api.get(`/users/transaction/${userId}`)).data;
    }
    static async updateUserById(userId: number, userData: Partial<UserData>): Promise<ApiResponse<UserData>> {
        return (await api.put(`/users/update/${userId}`, userData));
    }
    static async deleteUser(userId: number): Promise<RegisterResponse> {
        return (await api.delete(`/users/delete/${userId}`)).data;
    }
    static logout(): void {
        this.clearAuth();
    }
    static isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token;
    }
    static isAdmin(): boolean {
        const role = this.getRole();
        return role === "ADMIN";
    }
    static async createCategory(categoryData: any): Promise<ApiResponse<CategoryData>> {
        return (await api.post(`/categories/add`, categoryData));
    }
    static async getAllCategories(): Promise<ApiResponse<CategoryData[]>> {
        return (await api.get(`/categories/all`));
    }
    static async getAllCategorySummaries(): Promise<ApiResponse<CategorySummariesData[]>> {
        return (await api.get(`/categories/summaries`));
    }
    static async getCategorySummariesById(categoryId: number): Promise<ApiResponse<CategorySummaryData>> {
        return (await api.get(`/categories/summaries/${categoryId}`));
    }
    static async getCategoryById(categoryId: number): Promise<ApiResponse<CategoryData>> {
        return (await api.get(`/categories/${categoryId}`));
    }
    static async updateCategory(categoryId: number, categoryData: { name: string, code: string }): Promise<any> {
        return (await api.put(`/categories/update/${categoryId}`, categoryData)).data;
    }
    static async deleteCategory(categoryId: number): Promise<ResponseData> {
        return (await api.delete(`/categories/delete/${categoryId}`)).data;
    }
    static async addProduct(productData: FormData): Promise<ResponseData> {
        return (await api.post(`/products/add`, productData)).data;
    }
    static async getAllProducts(): Promise<ApiResponse<ProductData[]>> {
        return (await api.get(`/products/info/all`));
    }
    static async getAllStockWithSupplierAndProduct(): Promise<ApiResponse<StockWithSupplierAndProduct[]>> {
        return (await api.get(`/inventory/stock/all-with-supplier`));
    }
    static async getProductInfoDetail(productId: number): Promise<ApiResponse<ProductDetailData>> {
        return (await api.get(`/products/info-detail/${productId}`));
    }
    static async getProductsByCategory(categoryId: number): Promise<ApiResponse<ProductData[]>> {
        return (await api.get(`/products/all/by-category/${categoryId}`)).data;
    }

    static async getProductsById(productId: number): Promise<ApiResponse<ProductData>> {
        return (await api.get(`/products/${productId}`)).data;
    }

    static async getProductsBySupplier(supplierId: number): Promise<any> {
        return (await api.get(`/products/all/supplier/${supplierId}`)).data;
    }
    static async updateProduct(productData: FormData, productId: number): Promise<ApiResponse<ProductData>> {
        return (await api.put(`/products/update/${productId}`, productData)).data;
    }
    static async deleteProduct(id: number): Promise<ResponseData> {
        return (await api.delete(`/products/delete/${id}`)).data;
    }
    static async getAllSuppliers(): Promise<ApiResponse<SupplierData[]>> {
        return (await api.get(`/suppliers/all`));
    }
    static async addSupplier(data: SupplierData): Promise<ApiResponse<SupplierData[]>> {
        return (await api.post(`/suppliers/add`, data));
    }
    static async getSupplierById(supplierId: number): Promise<ApiResponse<SupplierData>> {
        return (await api.get(`/suppliers/${supplierId}`));
    }
    static async getSupplierProductsWithStock(supplierId: Number): Promise<ApiResponse<SupplierProductWithCategoryData[]>> {
        return (await api.get(`/sup-product/with-stock/${supplierId}`));
    }
    static async getSupplierProductsWithLeadTime(supplierId: Number): Promise<ApiResponse<SupplierProductWithCategoryData[]>> {
        return (await api.get(`/sup-product/with-lead-time/${supplierId}`));
    }
    static async getAllSupllierProductWithSkuByCategory(categoryId: Number): Promise<ApiResponse<ProductWithSkuByCategoryData[]>> {
        return (await api.get(`/products/with-sku-by-category/${categoryId}`));
    }
    static async deleteSupplier(supplierId: number): Promise<ApiResponse<void>> {
        return (await api.delete(`/suppliers/delete/${supplierId}`));
    }

    static async getPurchaseOrders(): Promise<ApiResponse<PurchaseOrderData[]>> {
        return (await api.get(`/transactions/purchase/all`));
    }
    static async deletePurchaseOrder(orderId: number): Promise<ApiResponse<void>> {
        return (await api.delete(`/transactions/purchase/delete/${orderId}`));
    }
    static async getPurchaseOrderById(poId: number): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.get(`/transactions/purchase/${poId}`));
    }
    static async getSumReceivedQtyByPoGroupByProduct(poId: number): Promise<ApiResponse<SumReceivedGroupByProduct[]>> {
        return (await api.get(`/products/received-qty/${poId}`));
    }
    static async updatePurchaseOrderQuantityAndDescription(poId: number, data: PurchaseOrderData): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.put(`/transactions/purchase/update-qty-and-desc/${poId}`, data));
    }
    static async placePurchaseOrder(poId: number): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.put(`/transactions/purchase/place/${poId}`));
    }
    static async getAllWarehouseWithLocation(): Promise<ApiResponse<WarehouseWithLocationData[]>> {
        return (await api.get(`/warehouses/with-location/all`));
    }
    static async getAllWarehouseWithLocationBySku(sku: string): Promise<ApiResponse<WarehouseWithLocationData[]>> {
        return (await api.get(`/warehouses/all-by-sku/with-location/${sku}`));
    }
    static async receiveStock(receiveItem: ReceiveStockItem[], poId: number): Promise<ApiResponse<StockResultData[]>> {
        return (await api.post(`/inventory/stock/receive-stock/${poId}`, receiveItem));
    }
    static async getInventoryHistoryByPurchaseOrder(poId: number): Promise<ApiResponse<InventoryHistoryByPurchaseOrder[]>> {
        return (await api.get(`/inventory/stock-history/purchase-order/${poId}`));
    }
    static async createPurchaseOrder(purchaseData: PurchaseOrderItem): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.post(`/transactions/purchase/add`, purchaseData));
    }
    static async placeOrder(poId: number): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.put(`/transactions/purchase/place/${poId}`));
    }
    static async getSaleOrders(): Promise<ApiResponse<SaleOrderData[]>> {
        return (await api.get(`/transactions/sales/all`));
    }
    static async getSaleOrderById(soId: number): Promise<ApiResponse<SaleOrderData>> {
        return (await api.get(`/transactions/sales/${soId}`));
    }
    static async updateSalesOrderQuantityAndDescription(soId: number, data: SaleOrderData): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.put(`/transactions/sales/update-qty-and-desc/${soId}`, data));
    }
    static async prepareSaleOrder(soId: number): Promise<ApiResponse<SaleOrderData>> {
        return (await api.put(`/transactions/sales/prepare/${soId}`));
    }
    static async getInventoryHistoryBySaleOrder(soId: number): Promise<ApiResponse<InventoryHistoryBySaleOrder[]>> {
        return (await api.get(`/inventory/stock-history/sale-order/${soId}`));
    }
    static async deliverStock(deliverItem: DeliverStockItem[], soId: number): Promise<ApiResponse<StockResultData[]>> {
        return (await api.post(`/inventory/stock/deliver-stock/${soId}`, deliverItem));
    }
    static async createSaleOrder(sellData: SellOrderItem): Promise<ApiResponse<SaleOrderData>> {
        return (await api.post(`/transactions/sales/add`, sellData));
    }
    static async prepareOrder(soId: number): Promise<ApiResponse<SaleOrderData>> {
        return (await api.put(`/transactions/sales/prepare/${soId}`));
    }
    static async deleteSellOrder(orderId: number): Promise<ApiResponse<void>> {
        return (await api.delete(`/transactions/sales/delete/${orderId}`));
    }


    static async getAllStockHistoriesWithDetails(): Promise<ApiResponse<StockHistoriesWithDetailData[]>> {
        return (await api.get(`/inventory/stock-history/with-details/all`));
    }
    static async getAllWarehouses(): Promise<ApiResponse<WarehousesData[]>> {
        return (await api.get(`/warehouses/all`));
    }
    static async getWarehouseWithTotalChangedQty(): Promise<ApiResponse<WarehouseWithTotalChangedQtyData[]>> {
        return (await api.get(`/warehouses/all-with-total-changed-qty`));
    }

    static async createWarehouse(createItem: WarehouseFormData): Promise<ApiResponse<WarehousesData>> {
        return (await api.post(`/warehouses/add`, createItem));
    }
    static async updateWarehouse(id: number, updateItem: WarehouseFormData): Promise<ApiResponse<WarehousesData>> {
        return (await api.put(`/warehouses/update/${id}`, updateItem));
    }
    static async deleteWarehouse(id: number): Promise<ApiResponse<void>> {
        return (await api.delete(`/warehouses/delete/${id}`));
    }

    static async purchaseProduct(purchaseData: any): Promise<ApiResponse<PurchaseOrderData>> {
        return (await api.post(`/transactions/purchase`, purchaseData)).data;
    }
    static async sellProduct(sellData: any): Promise<SellData> {
        return (await api.post(`/transactions/sell`, sellData)).data;
    }
    static async getAllTransations(): Promise<TransactionsResponse> {
        return (await api.get(`/transactions/all`)).data;
    }
    static async getTransationsByUserId(userId: number): Promise<TransactionsResponse> {
        return (await api.get(`/transactions/user/${userId}`)).data;
    }
    static async updateTransaction(id: number, data: { description: string, note: string }): Promise<TransactionsResponse> {
        return (await api.put(`/transactions/update/${id}`, data)).data;
    }
    static async deleteTransaction(ids: number[]): Promise<TransactionsResponse[]> {
        const responses = await Promise.all(ids.map(id => api.delete(`/transactions/delete/${id}`)));
        return responses.map(res => res.data);
    }
    static async getDashboard(): Promise<DashboardDTO> {
        return (await api.get(`/transactions/dashboard`)).data;
    }
}
