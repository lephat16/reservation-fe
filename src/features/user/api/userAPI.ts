import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { ChangePasswordRequest, LoginHistories, UserData } from "../types/user";
import type { RegisterResponse } from "../../auth/types/auth";

export const userAPI = {

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
    deleteUser: async (userId: number): Promise<RegisterResponse> => {
        return (await api.delete(`/users/delete/${userId}`));
    },
    changePassword: async (userId: number, request: ChangePasswordRequest): Promise<ApiResponse<UserData>> => {
        return (await api.put(`/users/${userId}/password`, request));
    },
    getLoginHistories: async (): Promise<ApiResponse<LoginHistories[]>> => {
        return (await api.get(`/users/login-history`,));
    },

}



