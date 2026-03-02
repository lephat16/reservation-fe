import { isAxiosError } from "axios"

/**
 * エラーメッセージ取得ユーティリティ関数
 * 
 * API通信（Axios）および一般的なErrorオブジェクトから
 * ユーザー表示用のエラーメッセージを安全に取得する。
 *
 * @param error 例外オブジェクト（unknown型）
 * @returns 表示用エラーメッセージ文字列
 */

export const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        return data?.message ?? 'エラーが発生しました';
    }
    if (error instanceof Error) return error.message;
    return '不明なエラーが発生しました';
}