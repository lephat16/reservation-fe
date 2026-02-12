import { useSelector } from "react-redux";
import type { RootState } from "../../features/auth/store";
import { canAccess } from "../role/roleUtils";
import type { Role } from "../../features/auth/types/auth";

export const useAuth = () => {
    const token = useSelector((s: RootState) => s.auth.accessToken);
    const user = useSelector((s: RootState) => s.auth.user);

    return {
        token,
        user,
        isAuthenticated: Boolean(token),
        canAccess: (requiredRoles?: Role[]) => canAccess(user?.role, requiredRoles),
    };
};

