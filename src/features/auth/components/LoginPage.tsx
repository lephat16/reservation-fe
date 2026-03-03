import { useEffect, type JSX } from "react";
import { useNavigate, } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { LoginRequest } from "../types/auth";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import type { AxiosError } from "axios";
import { authAPI } from "../api/authAPI";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice";
import LoginCard from "./LoginCard";
import type { RootState } from "../store";
import AuthLayout from "./AuthLayout";

/** 
 * ログインページコンポーネント
 * 
 * ユーザーがメールアドレスとパスワードを入力してログインするページ。
 * ログイン成功時にはユーザー情報をReduxに保存し、スナックバーで通知。
 * 未ログイン時にページを訪れた場合、ログインフォームを表示。
 * 
 * @returns JSX.Element - ログインページ全体のUIコンポーネント
 */

// yupを使ったフォームバリデーションスキーマ
const schema = yup.object({
    email: yup
        .string()
        .email("有効なメールアドレスを入力してください。")
        .required("メールアドレスは必須です。"),
    password: yup.string().required("パスワードは必須です。"),
});

const LoginPage = (): JSX.Element => {

    // ページ遷移用
    const navigate = useNavigate();
    // スナックバー状態管理
    const { showSnackbar } = useSnackbar();

    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    // ユーザーが既にログインしている場合、倉庫一覧ページにリダイレクト
    useEffect(() => {
        if (user) {
            navigate("/warehouses");
        }
    }, [user, navigate]);

    // react-hook-formのセットアップとYupバリデーション
    const {
        control,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<LoginRequest>({
        resolver: yupResolver(schema),
        // mode: "onBlur", // フォーカスが外れたタイミングでバリデーション
        defaultValues: {
            email: "",
            password: ""
        }
    });

    // ログインAPI呼び出し用のmutation
    const mutation = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const response = await authAPI.loginUser(data);
            return response;
        },
        onSuccess: (response) => {
            // Reduxにユーザー情報を保存
            dispatch(setUser(response.data.user || null));
            // 成功スナックバーを表示
            showSnackbar("ログインしました。", "success");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            // エラースナックバーを表示
            showSnackbar(error.response?.data?.message ||
                "ログインに失敗しました。", "error"
            );
            reset(); // フォームリセット
        }
    });

    // フォーム送信時の処理
    const onSubmit = (data: LoginRequest) => {
        mutation.mutate(data); // mutationを実行
    };

    return (
        <>
            {/* 認証用レイアウトでラップ */}
            <AuthLayout>
                {/* ログインフォームカード */}
                <LoginCard
                    control={control} // フォームコントロール
                    errors={errors} // バリデーションエラー
                    onSubmit={onSubmit}  // フォーム送信時のコールバック
                    handleSubmit={handleSubmit} // react-hook-formのhandleSubmit
                    isLoading={mutation.isPending} // ローディング状態
                />
            </AuthLayout>




        </>
    );
};

export default LoginPage;
