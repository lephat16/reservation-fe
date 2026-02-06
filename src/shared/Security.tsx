import { type JSX } from 'react'
import { Navigate, useLocation } from "react-router-dom"
import ApiService from "./api/ApiService"
import { useUser } from './hooks/UserContext';

type RouteProps = {
    element: JSX.Element;
}

export const ProtectedRoute = ({ element: Component }: RouteProps): JSX.Element => {
    const { isAuthenticated } = useUser();
    const location = useLocation();
    return isAuthenticated ? (
        Component
    ) : (
        <Navigate to='/login' replace state={{ from: location }} />
    )
}
export const AdminRoute = ({ element: Component }: RouteProps): JSX.Element => {
    const location = useLocation();
    return ApiService.isAdmin() ? (
        Component
    ) : (
        <Navigate to='/login' replace state={{ from: location }} />
    );
};

