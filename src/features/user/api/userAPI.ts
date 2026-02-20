import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { ChangePasswordRequest, LoginHistories, SetPasswordRequest, UserData, UserRequestData } from "../types/user";

export const userAPI = {

    createUserByAdmin: async (request: UserRequestData): Promise<ApiResponse<void>> => {
        return (await api.post(`/users/create`, request));
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
        return (await api.get(`/users/all`));
    },
    getLoggedInUser: async (): Promise<ApiResponse<UserData>> => {
        return ((await api.get(`/users/current`)));
    },
    getUserById: async (userId: number): Promise<UserData> => {
        return (await api.get(`/users/transaction/${userId}`));
    },
    updateUserById: async (userId: number, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
        return (await api.put(`/users/update/${userId}`, userData));
    },
    deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/users/delete/${userId}`));
    },
    changePassword: async (userId: number, request: ChangePasswordRequest): Promise<ApiResponse<UserData>> => {
        return (await api.put(`/users/${userId}/password`, request));
    },
    getLoginHistories: async (): Promise<ApiResponse<LoginHistories[]>> => {
        return (await api.get(`/users/login-history`,));
    },

}



