import { ROLES } from "../../constants/role";
import type { Role } from "../../features/auth/types/auth";

export const isAdmin = (role?: string) => role === ROLES.ADMIN.value;
export const isStaff = (role?: string) => role === ROLES.STAFF.value;
export const isWarehouse = (role?: string) => role === ROLES.WAREHOUSE.value;

export const canAccess = (role?: Role | null, requiredRoles?: Role[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(role as Role);
};
