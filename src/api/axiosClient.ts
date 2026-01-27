
import axios from "axios";
import ApiService from "../shared/api/ApiService";
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
api.interceptors.request.use(
    (config) => {
        const token = ApiService.getToken();
        const isAuthPath = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");
        if (token && !isAuthPath && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        // return axios(originalRequest);
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;
            const refreshToken = ApiService.getRefreshToken();
            if (!refreshToken) {
                ApiService.logout();
                return Promise.reject(error);
            }
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });
                const newAccessToken = res.data.token;
                const newRefreshToken = res.data.refreshToken;
                ApiService.saveToken(newAccessToken);
                ApiService.saveRefreshToken(newRefreshToken);
                api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                ApiService.logout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
