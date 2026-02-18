import { useEffect, type JSX } from "react";
import { useNavigate, } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { LoginRequest } from "../types/auth";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import type { AxiosError } from "axios";
import { authAPI } from "../api/authAPI";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice";
import LoginCard from "./LoginCard";
import type { RootState } from "../store";
import AuthLayout from "./AuthLayout";

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
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    console.log("Full state:", useSelector((state: RootState) => state));

    console.log(user);

    useEffect(() => {
        if (user) {
            navigate("/warehouses");
        }
    }, [user, navigate]);

    const {
        control,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<LoginRequest>({
        resolver: yupResolver(schema),
        mode: "onBlur",
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const response = await authAPI.loginUser(data);
            return response;
        },
        onSuccess: (response) => {
            dispatch(setUser(response.data.user || null));
            showSnackbar("ログインしました。", "success");
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
        <>
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            <AuthLayout>
                <LoginCard
                    control={control}
                    errors={errors}
                    onSubmit={onSubmit}
                    handleSubmit={handleSubmit}
                    isLoading={mutation.isPending}
                />
            </AuthLayout>




        </>
    );
};

export default LoginPage;
