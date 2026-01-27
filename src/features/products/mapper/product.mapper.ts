import type {
  ProductDetailData,
  ProductData,
  ProductDataDTO,
  ProductDetailDataDTO
} from "../types/product";

export function mapProductDetailResponse(data: ProductDetailDataDTO): ProductDetailData {
  return {
    product: mapProductDTO(data.productDTO),
    supplier: (data.supplierPriceDTO),
    stockHistory: (data.stockHistoryDTO),
    inventoryStock: (data.inventoryStockDTO),
  };
}

function mapProductDTO(dto: ProductDataDTO): ProductData {
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


