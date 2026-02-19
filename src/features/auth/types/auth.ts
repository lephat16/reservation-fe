import { ROLES } from "../../../constants/role";
import type { UserData } from "../../user/types/user";

export type Role = (typeof ROLES)[keyof typeof ROLES]["value"];

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    remember?:boolean;
}

export interface RegisterResponse {
    status: string;
    message: string;
    timestamp: string;
}

export interface LoginData {
    role: Role;
    expirationTime: string;
    user?: UserData;
}
export interface LoginResponse {
    status: string;
    message: string;
    timestamp: string;
    data: LoginData
}









