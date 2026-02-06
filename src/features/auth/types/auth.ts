
export const ROLES = {
    ADMIN: "ADMIN",
    STAFF: "STAFF",
    WAREHOUSE: "WAREHOUSE",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterResponse {
    status: string;
    message: string;
    timestamp: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    role: Role;
    expirationTime: string;
    status: string;
    message: string;
    timestamp: string;
}


export interface UserData {
    id: number;
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: "ADMIN" | "STAFF" | "WAREHOUSE";
    createdAt: string;
}


export interface AllUserRespose {
    status: string;
    message: string;
    users: UserData[];
}
