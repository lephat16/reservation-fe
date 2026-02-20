import { api } from "../../../shared/api/axiosClient";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, } from "../types/auth";

export const authAPI = {

    registerUser: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
        return (await api.post(`/auth/register`, registerData));
    },
    loginUser: async (loginUser: LoginRequest): Promise<LoginResponse> => {
        return (await api.post(`/auth/login`, loginUser));
    },
    logout: async (): Promise<void> => {
        await api.post("/auth/logout");
    },
   
}



