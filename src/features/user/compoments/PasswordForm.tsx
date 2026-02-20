import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import type { SetPasswordRequest } from "../types/user";
import { userAPI } from "../api/userAPI";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import * as yup from "yup";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";

type PasswordFormProps = {
    token: string;
    title: string;
};

type ResetRequest = {
    password: string,
    confirmPassword: string
}

const schema = yup.object({
    password: yup
        .string()
        .required("パスワードを入力してください")
        .min(8, "8文字以上にしてください"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "パスワードが一致しません")
        .required("確認用パスワードを入力してください"),
});

const PasswordForm = ({ token, title }: PasswordFormProps) => {
    const navigate = useNavigate();
    const { showSnackbar, snackbar, closeSnackbar } = useSnackbar();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetRequest>({
        resolver: yupResolver(schema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (data: SetPasswordRequest) =>
            userAPI.setPasswordByToken(data),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.RESET_PASSWORD_SUCCESS, "success");
            setTimeout(() => {
                navigate("/login");
            }, 800);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.RESET_PASSWORD_CREATE_FAILED, "error");
        }
    });

    const onSubmit = (data: ResetRequest) => {
        resetPasswordMutation.mutate({
            token,
            password: data.password,
        });
    };

    return (
        <Box mt={3} height="75vh">
            {/* メッセージ表示 */}
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2} width={400} mx="auto" mt={5}>
                    <Typography variant="h6">{title}</Typography>

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="password"
                                label="新しいパスワード"
                                error={!!errors.password}
                                helperText={errors.password?.message || " "}
                                fullWidth
                            />
                        )}
                    />

                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="password"
                                label="パスワード確認"
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message || " "}
                                fullWidth
                            />
                        )}
                    />

                    <Button type="submit" variant="contained">
                        {resetPasswordMutation.isPending ? "更新中..." : "保存"}
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};
export default PasswordForm;