import { useQuery } from "@tanstack/react-query";
import type { SupplierData } from "../types/supplier";
import { supplierAPI } from "../api/supplierAPI";


export const useAllSuppliers = () => {
    return useQuery<SupplierData[]>({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const resSuppliers = await supplierAPI.getAllSuppliers();
            return resSuppliers.data;
        }
    })
}
