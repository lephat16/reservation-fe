import { useSelector } from "react-redux";
import type { RootState } from "../../features/auth/store";
import { canAccess } from "../role/roleUtils";
import type { Role } from "../../features/auth/types/auth";

// 認証情報を取得するカスタムフック
export const useAuth = () => {
    // Redux store からアクセストークン,ユーザー情報を取得
    const user = useSelector((s: RootState) => s.auth.user);

    return {
        user,
        isAuthenticated: Boolean(user),
        canAccess: (requiredRoles?: Role[]) => canAccess(user?.role, requiredRoles),
    };
};

