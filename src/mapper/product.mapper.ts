import type {
  ProductDetailData,
  ProductData,
  StockHistory,
  InventoryStock
} from "../types/product";
import type { SupplierData } from "../types/category";

export function mapProductDetailResponse(data: any): ProductDetailData {
  return {
    product: mapProductDTO(data.productDTO),
    supplier: mapSupplierDTO(data.supplierPriceDTO),
    stockHistory: mapStockHistoryDTO(data.stockHistoryDTO),
    inventoryStock: mapInventoryStockDTO(data.inventoryStockDTO),
  };
}

function mapProductDTO(dto: any): ProductData {
  return {
    id: dto.id,
    productName: dto.name,              
    code: dto.productCode,              
    description: dto.description,
    status: dto.status,
    totalStock: dto.totalStock,
    unit: dto.unit,
    categoryName: dto.categoryName,
  };
}

function mapSupplierDTO(list: any[]): SupplierData[] {
  if (!Array.isArray(list)) return [];

  return list.map(s => ({
    supplierId: s.supplierId,
    supplierName: s.supplierName,
    price: s.price,
    sku: s.sku
  }));
}


function mapStockHistoryDTO(list: any[]): StockHistory[] {
  if (!Array.isArray(list)) return [];

  return list.map(h => ({
    changeQty: h.changeQty,
    type: h.type,
    createdAt: h.createdAt
  }));
}

function mapInventoryStockDTO(list: any[]): InventoryStock[] {
  if (!Array.isArray(list)) return [];

  return list.map(i => ({
    warehouseName: i.warehouseName,
    quantity: i.quantity
  }));
}
