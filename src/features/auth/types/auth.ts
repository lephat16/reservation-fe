import { ROLES } from "../../../constants/role";
import type { UserData } from "../../user/types/user";
/**
 * 認証関連の型定義
 *
 * ユーザー登録・ログインのリクエスト・レスポンス型や、
 * 役割 (Role) 型を定義。
 */

/**
 * ユーザーの役割（Role）の型
 *
 * ROLES 定数の value を取り出す
 */
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









