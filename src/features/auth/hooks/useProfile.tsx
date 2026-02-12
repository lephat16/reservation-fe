import { useQuery } from "@tanstack/react-query";
import type { UserData } from "../types/auth";
import { authAPI } from "../api/authAPI";

// ローカルストレージのキーとして"profile"を設定
const LOCAL_STORAGE_KEY = "profile";

export const useProfile = () => {
    // ローカルストレージからデータを取得し、初期データを設定
    const fallbackData = (() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? (JSON.parse(stored) as UserData) : undefined;
    })();

    return useQuery<UserData, Error>({
        queryKey: ["profile"],
        queryFn: async () => {
            
            const profileRes = await authAPI.getLoggedInUser();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profileRes.data));
            return profileRes.data;
        },
        initialData: fallbackData, // 初期データとしてローカルストレージから取得したデータを設定
        staleTime: 1000 * 60 * 5, // データが新しいと見なす時間（ここでは5分）

    });
};
