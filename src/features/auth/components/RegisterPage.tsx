import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import type { RegisterRequest } from "../types/auth";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import type { AxiosError } from "axios";
import { authAPI } from "../api/authAPI";
import RegisterCard from "./RegisterCard";
import AuthLayout from "./AuthLayout";

// yupを使ったフォームバリデーションスキーマ
const schema = yup.object({
    name: yup
        .string()
        .required("名前は必須です。"),
    email: yup
        .string()
        .email("有効なメールアドレスを入力してください。")
        .required("メールアドレスは必須です。"),
    password: yup
        .string()
        .required("パスワードは必須です。")
        .min(8, "パスワードは8文字以上入力してください。"),
    phoneNumber: yup
        .string()
        .required("電話番号は必須です。")
        .matches(/^[0-9]{10,11}$/, "電話番号は10~11桁の数字入力してください。"),
});

const RegisterPage = (): JSX.Element => {

    // ページ遷移用
    const navigate = useNavigate();

    // スナックバー状態管理
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    // React Hook Form初期化
    const {
        control,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<RegisterRequest>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: RegisterRequest) => {
            // APIに登録クエスト
            const response = await authAPI.registerUser(data);
            return response;
        },
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
        <>
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            <AuthLayout>
                <RegisterCard
                    control={control}
                    errors={errors}
                    onSubmit={onSubmit}
                    handleSubmit={handleSubmit}
                    isLoading={mutation.isPending}
                />
            </AuthLayout>


        </>
    )
}

export default RegisterPage;