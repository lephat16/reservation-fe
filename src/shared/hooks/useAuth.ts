// src/shared/hooks/useAuth.ts
import { useSelector } from "react-redux";
import type { RootState } from "../../features/auth/store";
import { canAccess } from "../role/roleUtils";
import type { Role } from "../../features/auth/types/auth";

export const useAuth = () => {
    const token = useSelector((s: RootState) => s.auth.accessToken);
    const role = useSelector((s: RootState) => s.auth.role);

    return {
        token,
        role,
        isAuthenticated: Boolean(token),
        canAccess: (requiredRoles?: Role[]) => canAccess(role, requiredRoles),
    };
};

