import { useQuery } from "@tanstack/react-query";
import type { InventoryHistoryBySaleOrder } from "../types/stock";
import { stockAPI } from "../api/stockAPI";

export const useInventoryHistoryBySaleOrder = (soId: number) => {
    return useQuery<InventoryHistoryBySaleOrder[]>({
        queryKey: ["stock-history-by-so"],
        queryFn: async () => {
            const resInventoryHistoryBySaleOrder = await stockAPI.getInventoryHistoryBySaleOrder(soId);
            return resInventoryHistoryBySaleOrder.data
        },
        enabled: !!soId
    })
}
