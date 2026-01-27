import CryptoJS from "crypto-js";

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
    static saveRole(role: string): void {
        const encryptRole = this.encrypt(role);
        localStorage.setItem("role", encryptRole);
    }
    static getRole(): string | null {
        const encryptedRole = localStorage.getItem("role");
        if (!encryptedRole) return null;
        return this.decrypt(encryptedRole);
    }
    static clearAuth(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }

    static logout(): void {
        this.clearAuth();
    }
    static isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token;
    }
    static isAdmin(): boolean {
        const role = this.getRole();
        return role === "ADMIN";
    }
    
}
