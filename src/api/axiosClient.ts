
import axios from "axios";
import ApiService from "../shared/api/ApiService";
import { store } from "../features/auth/store";
import { setToken } from "../features/auth/store/authSlice";
import { logout } from "../features/auth/store/authSlice";


// axiosインスタンスの作成（基本URLを環境変数から取得）
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});
// トークンのリフレッシュ状態を追跡
let isRefreshing = false;
// トークンリフレッシュ中に失敗したリクエストをキューに保存
let failedQueue: any[] = [];

// キュー内のリクエストを処理する関数
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = []; // キューをクリア
};

// リクエストインターセプター
api.interceptors.request.use(
    (config) => {
        // const token = ApiService.getToken();
        const token = store.getState().auth.accessToken;
        const isAuthPath =
            config.url?.includes("/auth/login") ||
            config.url?.includes("/auth/register") ||
            config.url?.includes("/auth/refresh");
        if (typeof token === "string" &&
            token.trim() !== "" &&
            !isAuthPath &&
            config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// レスポンスインターセプター
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        // 元のリクエストを取得
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {

            // もしすでにトークンのリフレッシュ処理が行われている場合
            if (isRefreshing) {
                // 新たなリクエストが来た場合、失敗したリクエストをキューに追加して後で処理する
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers = originalRequest.headers ?? {};
                            // トークンが取得できたら、元のリクエストに新しいトークンを設定
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject
                    });
                });

            }

            // リフレッシュトークンがある場合
            originalRequest._retry = true;
            isRefreshing = true;
            const refreshToken = ApiService.getRefreshToken(); // リフレッシュトークンを取得
            if (!refreshToken) {
                logout();
                return Promise.reject(error);
            }
            try {
                // リフレッシュトークンを使って新しいアクセストークンを取得
                const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });
                const newAccessToken = res.data.token; // 新しいアクセストークン
                const newRefreshToken = res.data.refreshToken; // 新しいリフレッシュトークン
                // ApiService.saveToken(newAccessToken);
                store.dispatch(setToken(newAccessToken));
                ApiService.saveRefreshToken(newRefreshToken);

                // デフォルトのAuthorizationヘッダーを更新
                // api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // キュー内のリクエストを処理
                processQueue(null, newAccessToken);
                // 元のリクエストを再実行
                return api(originalRequest);
            } catch (err) {
                // エラーが発生した場合、キュー内のリクエストをすべて拒否
                processQueue(err, null);
                logout() // ログアウト処理
                return Promise.reject(err);
            } finally {
                isRefreshing = false; // リフレッシュフラグをリセット
            }
        }
        return Promise.reject(error);
    }
);
