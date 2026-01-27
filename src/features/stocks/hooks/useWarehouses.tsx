import { useQuery } from "@tanstack/react-query";
import type { WarehousesData } from "../types/stock";
import { stockAPI } from "../api/stockAPI";

export const useWarehouses = () => {
    return useQuery<WarehousesData[]>({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const resWarehouses = await stockAPI.getAllWarehouses();
            return resWarehouses.data;
        }
    })
}