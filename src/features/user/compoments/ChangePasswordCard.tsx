import { Button, Card, IconButton, InputAdornment, Stack, TextField, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import * as yup from 'yup';
import type { ChangePasswordRequest } from "../types/user";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type ChangePasswordProps = {
    onSubmit?: (request: ChangePasswordRequest) => void;
};

const schema = yup.object({
    currentPassword: yup
        .string()
        .required("現在のパスワードを入力してください")
        .min(8, "パスワードは8文字以上必要です"),

    newPassword: yup
        .string()
        .required("新しいパスワードを入力してください")

        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
            "大文字・小文字・数字・記号を含めてください"
        ),

    confirmPassword: yup
        .string()
        .required("確認パスワードを入力してください")
        .oneOf([yup.ref("newPassword")], "パスワードが一致しません"),
});
const ChangePasswordCard = ({ onSubmit }: ChangePasswordProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>, field: keyof typeof showPassword) => {
        event.preventDefault();
        setShowPassword((prev) => ({
            ...prev,
            [field]: true
        }));
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>, field: keyof typeof showPassword) => {
        event.preventDefault();
        setShowPassword((prev) => ({
            ...prev,
            [field]: false
        }));
    };



    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<ChangePasswordRequest>({
        resolver: yupResolver(schema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        shouldFocusError: true
    });

    const handleFormSubmit = async (data: ChangePasswordRequest) => {
        try {
            if (!onSubmit) return;
            await onSubmit(data);
            reset({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            if (error.response?.data?.fieldErrors) {
                Object.entries(error.response.data.fieldErrors)
                    .forEach(([field, message]) => {
                        setError(field as keyof ChangePasswordRequest, {
                            type: "server",
                            message: message as string
                        });
                    });
            } else if (error.response?.data?.message) {
                setError("currentPassword", {
                    type: "server",
                    message: error.response.data.message
                });
            }
        }
    };
    return (
        <Card
            sx={{
                p: 3,
                background: colors.primary[400],
                mt: 2
            }}
        >
            <Typography
                className="title"
                variant="h4"
                align="center"
                fontWeight="bold"
                sx={{ color: colors.grey[100], mb: 2 }}
            >
                パスワード変更
            </Typography>
            <Stack spacing={2} component="form" onSubmit={handleSubmit(handleFormSubmit)}>
                <Controller
                    name="currentPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField

                            {...field}
                            type="password"
                            label="現在のパスワード"
                            variant="outlined"
                            fullWidth
                            slotProps={{
                                input: {
                                    type: showPassword.current ? 'text' : 'password',
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                tabIndex={-1}
                                                aria-label={
                                                    showPassword.current ? 'hide the password' : 'display the password'
                                                }
                                                onMouseDown={(e) => handleMouseDown(e, "current")}
                                                onMouseUp={(e) => handleMouseUp(e, "current")}
                                                onMouseLeave={(e) => handleMouseUp(e, "current")}
                                                edge="end"
                                            >
                                                {showPassword.current ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }
                            }}
                            error={!!errors.currentPassword}
                            helperText={errors.currentPassword ? errors.currentPassword.message : ' '}
                            sx={{ mb: 2 }}
                        />
                    )}
                />

                <Controller
                    name="newPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="password"
                            label="新しいパスワード"
                            variant="outlined"
                            fullWidth
                            slotProps={{
                                input: {
                                    type: showPassword.new ? 'text' : 'password',
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                tabIndex={-1}
                                                aria-label={
                                                    showPassword.new ? 'hide the password' : 'display the password'
                                                }
                                                onMouseDown={(e) => handleMouseDown(e, "new")}
                                                onMouseUp={(e) => handleMouseUp(e, "new")}
                                                onMouseLeave={(e) => handleMouseUp(e, "new")}
                                                edge="end"
                                            >
                                                {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }
                            }}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword ? errors.newPassword.message : ' '}
                            sx={{ mb: 2 }}
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
                            variant="outlined"
                            fullWidth
                            slotProps={{
                                input: {
                                    type: showPassword.confirm ? 'text' : 'password',
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                tabIndex={-1}
                                                aria-label={
                                                    showPassword.confirm ? 'hide the password' : 'display the password'
                                                }
                                                onMouseDown={(e) => handleMouseDown(e, "confirm")}
                                                onMouseUp={(e) => handleMouseUp(e, "confirm")}
                                                onMouseLeave={(e) => handleMouseUp(e, "confirm")}
                                                edge="end"
                                            >
                                                {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }
                            }}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword ? errors.confirmPassword.message : ' '}
                            sx={{ mb: 2 }}
                        />
                    )}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">

                    <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        disabled={isSubmitting}
                    >
                        更新
                    </Button>
                </Stack>
            </Stack>
        </Card >
    );
};

export default ChangePasswordCard;