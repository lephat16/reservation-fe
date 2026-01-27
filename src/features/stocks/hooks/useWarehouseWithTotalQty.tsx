import { useQuery } from "@tanstack/react-query";
import type { WarehouseWithTotalChangedQtyData } from "../types/stock";
import { stockAPI } from "../api/stockAPI";

export const useWarehouseWithTotalQty = () => {
    return useQuery<WarehouseWithTotalChangedQtyData[]>({
        queryKey: ["warehouses-with-total"],
        queryFn: async () => {
            const resWarehouses = await stockAPI.getWarehouseWithTotalChangedQty();
            return resWarehouses.data;
        }
    })
}