import { type JSX } from 'react'
import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux";
import type { RootState } from '../features/auth/store';
import { useAuth } from './hooks/useAuth';
import type { Role } from '../features/auth/types/auth';
type Props = {
    element: JSX.Element;
    requiredRoles?: Role[];
};

export const ProtectedRoute = ({ element, requiredRoles }: Props) => {
    const { isAuthenticated, canAccess } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!canAccess(requiredRoles)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return element;
};



