
import axios from "axios";
import { logout } from "../../features/auth/store/authSlice";
import { store } from "../../features/auth/store";


// axiosインスタンスの作成（基本URLを環境変数から取得）
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});


// レスポンスインターセプター
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        
        if (error.response?.status === 401) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

