
import axios from "axios";
import { logout } from "../../features/auth/store/authSlice";
import { store } from "../../features/auth/store";
import { PUBLIC_ENDPOINT } from "../../constants/endpoint";


// axiosインスタンスの作成（基本URLを環境変数から取得）
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});


// レスポンスインターセプター
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        // // 元のリクエストを取得
        // const originalRequest = error.config;
        // const isLoggedIn = !!store.getState().auth.user;
        // if (error.response?.status === 401 &&
        //     !originalRequest._retry &&
        //     !originalRequest.url?.includes("/auth/refresh") &&
        //     !PUBLIC_ENDPOINT.some(path => originalRequest.url?.includes(path)) &&
        //     isLoggedIn) {
        //     // リフレッシュ開始
        //     originalRequest._retry = true;

        //     try {
        //         await api.post("/auth/refresh")
        //         // 元のリクエストを再実行
        //         return api(originalRequest);
        //     } catch (err) {
        //         // エラーが発生した場合、キュー内のリクエストをすべて拒否
        //         store.dispatch(logout());// ログアウト処理
        //         return Promise.reject(err);
        //     }
        // }
        if (error.response?.status === 401) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

