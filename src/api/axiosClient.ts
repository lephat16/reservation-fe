
import axios from "axios";
import ApiService from "../shared/api/ApiService";

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
        const token = ApiService.getToken();
        const isAuthPath = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");
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
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (ApiService.getToken() == null) {
                ApiService.logout(); // トークンが無ければログアウト
                return Promise.reject(error);
            }

            // もしすでにトークンのリフレッシュ処理が行われている場合
            if (isRefreshing) {
                // 新たなリクエストが来た場合、失敗したリクエストをキューに追加して後で処理する
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        // トークンが取得できたら、元のリクエストに新しいトークンを設定
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // リフレッシュトークンがある場合
            originalRequest._retry = true;
            isRefreshing = true;
            const refreshToken = ApiService.getRefreshToken(); // リフレッシュトークンを取得
            if (!refreshToken) {
                ApiService.logout();
                return Promise.reject(error);
            }
            try {
                // リフレッシュトークンを使って新しいアクセストークンを取得
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });
                const newAccessToken = res.data.token; // 新しいアクセストークン
                const newRefreshToken = res.data.refreshToken; // 新しいリフレッシュトークン
                ApiService.saveToken(newAccessToken);
                ApiService.saveRefreshToken(newRefreshToken);

                // デフォルトのAuthorizationヘッダーを更新
                api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // キュー内のリクエストを処理
                processQueue(null, newAccessToken);
                // 元のリクエストを再実行
                return api(originalRequest);
            } catch (err) {
                // エラーが発生した場合、キュー内のリクエストをすべて拒否
                processQueue(err, null);
                ApiService.logout(); // ログアウト処理
                return Promise.reject(err);
            } finally {
                isRefreshing = false; // リフレッシュフラグをリセット
            }
        }
        return Promise.reject(error);
    }
);
