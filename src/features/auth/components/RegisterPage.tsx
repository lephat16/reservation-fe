import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import type { RegisterRequest } from "../types/auth"; 
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar"; 
import '../styles/auth.css'
import type { AxiosError } from "axios";
import { authAPI } from "../api/authAPI";

// yupを使ったフォームバリデーションスキーマ
const schema = yup.object({
    name: yup.string().required("名前は必須です。"),
    email: yup.string()
        .email("有効なメールアドレスを入力してください。")
        .required("メールアドレスは必須です。"),
    password: yup.string()
        .required("パスワードは必須です。")
        .min(8, "パスワードは8文字以上入力してください。"),
    phoneNumber: yup.string()
        .required("電話番号は必須です。")
        .matches(/^[0-9]{10,11}$/, "電話番号は10~11桁の数字入力してください。"),
});

const registerApi = async (data: RegisterRequest) => {
    // APIに登録クエスト
    const response = await authAPI.registerUser(data);
    return response;
}

const RegisterPage = (): JSX.Element => {

    // ページ遷移用
    const navigate = useNavigate();

    // スナックバー状態管理
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    // React Hook Form初期化
    const {
        register,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<RegisterRequest>({
        resolver: yupResolver(schema),
        mode: "onBlur",
    });

    const mutation = useMutation({
        mutationFn: registerApi,
        onSuccess: () => {
            // 成功通知
            showSnackbar("登録に成功しました。", "success");
            setTimeout(() => navigate("/login"), 500); // ログインページへ遷移
        },
        onError: (error: AxiosError<{ message: string }>) => {
            // エラー時の通知
            showSnackbar(
                error.response?.data?.message || "登録に失敗しました。", "error"
            );
            reset(); // フォームリセット
        }
    })
    // フォーム送信処理
    const onSubmit = (data: RegisterRequest) => {
        mutation.mutate(data);
    }

    return (
        <div className="auth-container">
            <h2>登録</h2>
            {/* スナックバー表示 */}
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            {/* 登録フォーム */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <input type="text" placeholder="名前" {...register("name")} />
                    {errors.name && <p className="error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                    <input type="email" placeholder="メールアドレス" {...register("email")} />
                    {errors.email && <p className="error">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                    <input type="password" placeholder="パスワード" {...register("password")} />
                    {errors.password && <p className="error">{errors.password.message}</p>}
                </div>

                <div className="form-group">
                    <input type="text" placeholder="電話番号" {...register("phoneNumber")} />
                    {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}
                </div>

                <button type="submit" disabled={mutation.isPending}>
                    {/* 送信中の表示切替 */}
                    {mutation.isPending ? "登録中..." : "登録"}
                </button>
            </form>
            {/* ログインリンク */}
            <p className="footer-msg">すでに会員の方は<a href="/login">こちらからログイン</a>してください。</p>

        </div>
    )
}

export default RegisterPage;