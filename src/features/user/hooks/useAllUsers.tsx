import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../api/userAPI";
import type { UserData } from "../types/user";

export const useAllUsers = () => {
    return useQuery<UserData[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const usersData = await userAPI.getAllUsers();
            return usersData.data || [];
        }
    });
};