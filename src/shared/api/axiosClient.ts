
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { logout } from "../../features/auth/store/authSlice";
import { store } from "../../features/auth/store";


// axiosインスタンスの作成（基本URLを環境変数から取得）
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: {
    resolve: (value?: AxiosResponse) => void;
    reject: (error: AxiosError) => void;
}[] = [];

const processQueue = (error: AxiosError | null = null) => {
    failedQueue.forEach(p => {
        if (error) p.reject(error);
        else p.resolve();
    });
    failedQueue = [];
}


// レスポンスインターセプター
api.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfigWithRetry;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }
            isRefreshing = true;
            try {
                await api.post("/auth/refresh");
                processQueue();
                return api(originalRequest);
            } catch (refreshError: unknown) {
                processQueue(refreshError as AxiosError);
                store.dispatch(logout());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

