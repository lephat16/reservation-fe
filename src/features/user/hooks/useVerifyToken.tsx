
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../api/userAPI";

export const useVerifyResetToken = (token: string) => {
    return useQuery({
        queryKey: ["verify-reset-token", token],
        queryFn: () => userAPI.verifyResetToken(token),
        enabled: Boolean(token),
        retry: false,
    });
};