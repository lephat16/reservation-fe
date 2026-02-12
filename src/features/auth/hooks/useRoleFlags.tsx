
import { useSelector } from "react-redux";
import type { RootState } from '../store';

const useRoleFlags = () => {
    const role = useSelector((state: RootState) => state.auth.user?.role);
    return {
        role,
        isAdmin: role === "ADMIN",
        isStaff: role === "STAFF",
        isWarehouse: role === "WAREHOUSE",
    };
}

export default useRoleFlags;