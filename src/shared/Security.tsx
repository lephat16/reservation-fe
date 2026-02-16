import { useEffect, useState, type JSX } from 'react'
import { Navigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux";

import { useAuth } from './hooks/useAuth';
import type { Role } from '../features/auth/types/auth';
import { authAPI } from '../features/auth/api/authAPI';
import { setUser } from '../features/auth/store/authSlice';
type Props = {
    element: JSX.Element;
    requiredRoles?: Role[];
};

export const ProtectedRoute = ({ element, requiredRoles }: Props) => {
    const { canAccess, user } = useAuth();
    const location = useLocation();
    const [checked, setChecked] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkUser = async () => {
            if (!user) {
                try {
                    const profile = await authAPI.getLoggedInUser();
                    dispatch(setUser(profile.data));
                } catch {
                    dispatch(setUser(null));
                } finally {
                    setChecked(true);
                }
            } else {
                setChecked(true);
            }
        };
        checkUser();
    }, [user, dispatch])
    if (!checked) return <div>Loading...</div>;
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!canAccess(requiredRoles)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return element;
};



