import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyResetToken } from "../hooks/useVerifyToken";
import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
/**
 * パスワード再設定用トークンの検証を行うガードコンポーネント。
 * URLクエリパラメータからtokenを取得し、
 * 有効性を検証したうえで子コンポーネントへトークンを渡す。
 *
 * ・トークンが存在しない場合はログイン画面へリダイレクト
 * ・トークンが無効または期限切れの場合もログイン画面へリダイレクト
 * ・検証中はローディングメッセージを表示
 *
 * @param props TokenGuardのプロパティ
 * @returns 子要素またはnull
 */

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