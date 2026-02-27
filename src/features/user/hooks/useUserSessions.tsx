import { useQuery } from "@tanstack/react-query"
import { userAPI } from "../api/userAPI"


export const useUserSessions = (userId?: number) => {
    return useQuery({
        queryKey: ["user-sessions", userId],
        queryFn: async () => {
            if (!userId) return [];
            const userSessions = await userAPI.getUserSessions(userId);
            return userSessions.data || [];
        },
        enabled: !!userId,
    })
}