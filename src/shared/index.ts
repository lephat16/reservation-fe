
export interface ResponseData {
    status: number;
    message: string;
    timestamp: string;
}
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    timestamp: string;
    errors?: string[];
}