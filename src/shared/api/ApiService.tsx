import CryptoJS from "crypto-js";
import { ROLES, type Role } from "../../features/auth/types/auth";

export default class ApiService {
    static ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
    static encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
    }
    static decrypt(data: string): string {
        const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    static saveToken(token: string): void {
        const encryptToken = this.encrypt(token);
        localStorage.setItem("token", encryptToken);
    }
    static getToken(): string | null {
        const encryptedToken = localStorage.getItem("token");
        if (!encryptedToken) return null;
        return this.decrypt(encryptedToken);
    }
    static saveRefreshToken(refreshToken: string): void {
        const encryptRefreshToken = this.encrypt(refreshToken);
        localStorage.setItem("refreshToken", encryptRefreshToken);
    }
    static getRefreshToken(): string | null {
        const encryptedRefreshToken = localStorage.getItem("refreshToken");
        if (!encryptedRefreshToken) return null;
        return this.decrypt(encryptedRefreshToken);
    }
    static saveRole(role: Role): void {
        const encryptRole = this.encrypt(role);
        localStorage.setItem("role", encryptRole);
    }
    static getRole(): Role | null {
        const encryptedRole = localStorage.getItem("role");
        if (!encryptedRole) return null;
        const role = this.decrypt(encryptedRole);

        if (Object.values(ROLES).includes(role as Role)) {
            return role as Role;
        }

        return null;
    }
    static clearAuth(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("profile");
    }

    static logout(): void {
        this.clearAuth();
    }
    
    static isAdmin(): boolean {
        const role = this.getRole();
        return role === ROLES.ADMIN;
    }

    static isStaff(): boolean {
        const role = this.getRole();
        return role === ROLES.STAFF;
    }
    static isWarehouse(): boolean {
        const role = this.getRole();
        return role === ROLES.WAREHOUSE;
    }
}
