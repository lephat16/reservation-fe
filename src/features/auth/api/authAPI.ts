import { api } from "../../../api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { AllUserRespose, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserData } from "../types/auth";

export const authAPI = {

    registerUser: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
        return (await api.post(`/auth/register`, registerData)).data;
    },
    loginUser: async (loginUser: LoginRequest): Promise<LoginResponse> => {
        return (await api.post(`/auth/login`, loginUser)).data;
    },
    getAllUsers: async (): Promise<AllUserRespose> => {
        return (await api.get(`/users/all`)).data;
    },
    getLoggedInUser: async (): Promise<ApiResponse<UserData>> => {
        return ((await api.get(`/users/current`)));
    },
    getUserById: async (userId: number): Promise<UserData> => {
        return (await api.get(`/users/transaction/${userId}`)).data;
    },
    updateUserById: async (userId: number, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
        return (await api.put(`/users/update/${userId}`, userData));
    },
    deleteUser: async (userId: number): Promise<RegisterResponse> => {
        return (await api.delete(`/users/delete/${userId}`)).data;
    },
}
    

   
    