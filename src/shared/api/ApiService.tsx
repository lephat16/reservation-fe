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

    static saveRefreshToken(refreshToken: string): void {
        localStorage.setItem(
            "refreshToken",
            this.encrypt(refreshToken)
        );
    }

    static getRefreshToken(): string | null {
        const token = localStorage.getItem("refreshToken");
        return token ? this.decrypt(token) : null;
    }

    static clearAuth(): void {
        localStorage.removeItem("refreshToken");
    }

}
