import { isAxiosError } from "axios"

export const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        return data?.message ?? 'エラーが発生しました';
    }
    if (error instanceof Error) return error.message;
    return '不明なエラーが発生しました';
}