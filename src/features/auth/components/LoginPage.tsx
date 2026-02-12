import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../shared/api/ApiService";
import { useForm } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { LoginRequest } from "../types/auth";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import '../styles/auth.css'
import type { AxiosError } from "axios";
import { authAPI } from "../api/authAPI";
import { useDispatch } from "react-redux";
import { setToken, setRole } from "../store/authSlice";

// yupを使ったフォームバリデーションスキーマ
const schema = yup.object({
    email: yup
        .string()
        .email("有効なメールアドレスを入力してください。")
        .required("メールアドレスは必須です。"),
    password: yup.string().required("パスワードは必須です。"),
});

const loginApi = async (data: LoginRequest) => {
    const response = await authAPI.loginUser(data);
    return response;
}

const LoginPage = (): JSX.Element => {

    // ページ遷移用
    const navigate = useNavigate();
    // スナックバー状態管理
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    // const { refreshRole } = useUser();

    const dispatch = useDispatch();

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     if (token) {
    //         navigate("/profile", { replace: true });
    //     }
    // }, [navigate]);
    // React Hook Form初期化
    const {
        register,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<LoginRequest>({
        resolver: yupResolver(schema),
        mode: "onBlur",
    });

    const mutation = useMutation({
        mutationFn: loginApi,
        onSuccess: (response) => {
            // ApiService.saveToken(response.token);  // トークン保存
            // ApiService.saveRole(response.role); // ロール情報保存
            dispatch(setToken(response.token));
            dispatch(setRole(response.role));
            ApiService.saveRefreshToken(response.refreshToken) // リフレッシュトークン保存
            // refreshRole();
            showSnackbar("ログインしました。", "success");
            setTimeout(() => navigate("/profile"), 500); // カテゴリページへ遷移
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message ||
                "ログインに失敗しました。", "error"
            );
            reset(); // フォームリセット
        }
    });

    const onSubmit = (data: LoginRequest) => {
        mutation.mutate(data);
    };

    return (
        <div className="auth-container">
            <h2>ログイン</h2>
            {/* スナックバー表示 */}
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            {/* ログインフォーム */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        {...register("email")}
                    />
                    {errors.email && <p className="error">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="パスワード"
                        {...register("password")}
                    />
                    {errors.password && <p className="error">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={mutation.isPending}>
                    {/* 送信中の表示切替 */}
                    {mutation.isPending ? "ログイン中..." : "ログイン"}
                </button>
            </form>
            <p className="footer-msg">
                アカウントを持っていませんか？{" "}
                <a href="/register">登録はこちら</a>
            </p>
        </div>
    );
};

export default LoginPage;
