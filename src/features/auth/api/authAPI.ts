import { api } from "../../../shared/api/axiosClient";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, } from "../types/auth";

/**
 * 認証関連API
 *
 * ユーザー登録、ログイン、ログアウトなどの操作を提供する。
 */

export const authAPI = {

    /**
    * 新規ユーザーを登録する
    * 
    * @param registerData - 登録フォームの入力データ
    * @returns Promise<RegisterResponse> - 登録成功時のレスポンス
    */
    registerUser: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
        return (await api.post(`/auth/register`, registerData));
    },
    /**
     * ユーザーをログインさせる
     * 
     * @param loginUser - ログインフォームの入力データ
     * @returns Promise<LoginResponse> - ログイン成功時のレスポンス
     */
    loginUser: async (loginUser: LoginRequest): Promise<LoginResponse> => {
        return (await api.post(`/auth/login`, loginUser));
    },
    /**
     * ユーザーをログアウトさせる
     * 
     * @returns Promise<void> - 成功時は何も返さない
     */
    logout: async (): Promise<void> => {
        await api.post("/auth/logout");
    },

}



