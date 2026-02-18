import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

type Props = {
  element: JSX.Element;
};

export const PublicRoute = ({ element }: Props) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return element;
};
