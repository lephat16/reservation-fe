import { createContext, useContext, useEffect, useState } from "react";
import ApiService from "../api/ApiService";

type Role = "ADMIN" | "STAFF" | "WAREHOUSE" | null;

type UserContextType = {
    role: Role;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isStaff: boolean;
    isWarehouse: boolean;
    refreshRole: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<Role>(ApiService.getRole());

    const refreshRole = () => {
        setRole(ApiService.getRole());
    };
    const value: UserContextType = {
        role,
        isAuthenticated: !!role,
        isAdmin: role === "ADMIN",
        isStaff: role === "STAFF",
        isWarehouse: role === "WAREHOUSE",
        refreshRole,
    };
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("")
    }
    return context;
}