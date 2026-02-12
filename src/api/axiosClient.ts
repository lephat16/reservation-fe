
import axios from "axios";
import { store } from "../features/auth/store";
import { setToken } from "../features/auth/store/authSlice";
import { logout } from "../features/auth/store/authSlice";


// axiosインスタンスの作成（基本URLを環境変数から取得）
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});
// トークンのリフレッシュ状態を追跡
let isRefreshing = false;
// トークンリフレッシュ中に失敗したリクエストをキューに保存
let failedQueue: any[] = [];

let refreshPromise: Promise<string | null> | null = null;

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
        if (token && !isAuthPath && config.headers) {
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
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")) {

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
            if (!refreshPromise) {
                refreshPromise = api
                    .post("/auth/refresh")
                    .then(res => res.data?.data?.token || null)
                    .finally(() => {
                        refreshPromise = null;
                        isRefreshing = false;
                    });
            }

            try {
                // リフレッシュトークンを使って新しいアクセストークンを取得
                const newAccessToken = await refreshPromise; // 新しいアクセストークン
                if (!newAccessToken) throw new Error("No token");
                store.dispatch(setToken(newAccessToken));

                // デフォルトのAuthorizationヘッダーを更新
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

export const refreshAccessToken = async () => {
    
    if (!refreshPromise) {
        refreshPromise = api
            .post("/auth/refresh")
            .then(res => res.data?.token || null)
            .finally(() => {
                refreshPromise = null;
                isRefreshing = false;
            });
    }
    return refreshPromise;
}