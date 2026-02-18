import { type JSX } from 'react'
import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from '../hooks/useAuth';
import type { Role } from '../../features/auth/types/auth';

type Props = {
    element: JSX.Element;
    requiredRoles?: Role[];
};

export const ProtectedRoute = ({ element, requiredRoles }: Props) => {
    const { canAccess, user } = useAuth();
    const location = useLocation();
        
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!canAccess(requiredRoles)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return element;
};



