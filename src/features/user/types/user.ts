
export interface UserData {
    id: number;
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: "ADMIN" | "STAFF" | "WAREHOUSE";
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