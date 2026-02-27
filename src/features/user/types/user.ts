import type { Role } from "../../auth/types/auth";

export interface UserData {
    id: number;
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: Role;
    createdAt: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface LoginHistories {
    id: number;
    userId: string;
    loginTime: string;
    ipAddress: string;
    userAgent: string;
    status: string;
}
export interface UserRequestData {
    name: string;
    email: string;
    phoneNumber: string;
    role: Role;
}

export interface SetPasswordRequest {
    token: string;
    password: string;
};

type RevokedReason = "USER_LOGOUT" | "ROTATED";
type SessionStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export interface UserSession {
    id: number;
    userId: string;
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
    expiry: string;
    createdAt: string;
    revokedAt: string;
    revokedReason: RevokedReason;
    revoked: boolean;
    device: string;
    status: SessionStatus;
    currentSession: boolean;
}