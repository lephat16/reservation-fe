import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useVerifyResetToken } from "../hooks/useVerifyToken";
import { useEffect } from "react";
import { Typography } from "@mui/material";

type TokenGuardProps = {
    children: (token: string) => React.ReactNode;
};

const TokenGuard = ({ children }: TokenGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSnackbar } = useSnackbar();

    const token = new URLSearchParams(location.search).get("token") || "";

    const { isLoading, isError } = useVerifyResetToken(token);

    useEffect(() => {
        if (!token) {
            showSnackbar("無効なリンクです", "error");
            navigate("/login", { replace: true });
        }
    }, [token]);

    useEffect(() => {
        if (isError) {
            showSnackbar("無効または期限切れのリンクです", "error");
            navigate("/login", { replace: true });
        }
    }, [isError]);

    if (!token || isError) return null;

    if (isLoading) {
        return <Typography align="center" mt={5}>検証中...</Typography>;
    }

    return <>{children(token)}</>;
};

export default TokenGuard;