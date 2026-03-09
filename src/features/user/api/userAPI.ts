import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { ChangePasswordRequest, LoginHistories, SetPasswordRequest, UserData, UserRequestData, UserSession } from "../types/user";

export const userAPI = {

    createUserByAdmin: async (request: UserRequestData): Promise<ApiResponse<void>> => {
        return (await api.post(`/users/create-user`, request));
    },
    setPasswordByToken: async (request: SetPasswordRequest): Promise<ApiResponse<void>> => {
        return (await api.post(`/users/set-password`, request));
    },
    resetPasswordByToken: async (request: SetPasswordRequest): Promise<ApiResponse<void>> => {
        return (await api.post(`/users/reset-password`, request));
    },
    sendPasswordTokenEmail: async (email: string): Promise<ApiResponse<void>> => {
        return (await api.post(`/users/send-reset-password`, { email }));
    },
    verifyResetToken: async (token: string): Promise<ApiResponse<void>> => {
        return (await api.get("/users/verify-reset-token", {
            params: { token },
        }));
    },
    getAllUsers: async (): Promise<ApiResponse<UserData[]>> => {
        return (await api.get(`/users/all-users`));
    },
    getLoggedInUser: async (): Promise<ApiResponse<UserData>> => {
        return ((await api.get(`/users/current`)));
    },
    getUserById: async (userId: number): Promise<UserData> => {
        return (await api.get(`/users/transaction/${userId}`));
    },
    updateUserById: async (userId: number, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
        return (await api.put(`/users/${userId}/update`, userData));
    },
    deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/users/${userId}/delete`));
    },
    changePassword: async (userId: number, request: ChangePasswordRequest): Promise<ApiResponse<UserData>> => {
        return (await api.put(`/users/${userId}/change-password`, request));
    },
    getLoginHistories: async (): Promise<ApiResponse<LoginHistories[]>> => {
        return (await api.get(`/users/login-history`,));
    },
    getUserSessions: async (userId: number): Promise<ApiResponse<UserSession[]>> => {
        return (await api.get(`/users/${userId}/sessions`,));
    },
    revokeSession: async (sessionId: number): Promise<ApiResponse<void>> => {
        return (await api.get(`/users/sessions/${sessionId}/revoke`,));
    },
    revokeAllSessions: async (userId: number): Promise<ApiResponse<void>> => {
        return (await api.get(`/users/${userId}/sessions/revoke-all`,));
    }
}



