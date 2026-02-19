
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormLabel, Link, Typography } from '@mui/material';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import type { LoginRequest } from '../types/auth';

import { useState, type JSX } from 'react';
import ForgotPassword from '../../user/compoments/ForgotPassword';
import { AuthCard, AuthTextField } from '../styles/AuthCardStyle';


type CardLoginProps = {
    control: Control<LoginRequest>;
    errors: FieldErrors<LoginRequest>;
    onSubmit: (data: LoginRequest) => void;
    isLoading: boolean;
    handleSubmit: (callback: (data: LoginRequest) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const LoginCard = ({
    control,
    errors,
    onSubmit,
    handleSubmit,
    isLoading
}: CardLoginProps): JSX.Element => {

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <AuthCard variant="outlined">
            <Typography textAlign="center" component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
                ログイン
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 1 }}
            >
                <FormControl>
                    <FormLabel htmlFor="email">メールアドレス</FormLabel>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <AuthTextField
                                {...field}
                                id="email"
                                placeholder="taro@email.com"
                                autoComplete="email"
                                autoFocus
                                fullWidth
                                variant="outlined"
                                color={errors.email ? "error" : "primary"}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ' '}
                            />
                        )}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <FormLabel htmlFor="password">パスワード</FormLabel>
                        <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: "baseline" }}
                            tabIndex={-1}
                        >
                            パスワードをお忘れですか？
                        </Link>
                    </Box>

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <AuthTextField
                                {...field}
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                autoComplete="current-password"
                                fullWidth
                                variant="outlined"
                                color={errors.password ? "error" : "primary"}
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : ' '}

                            />
                        )}
                    />
                </FormControl>

                <Controller
                    name="remember"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} color="info" />}
                            label="ログイン状態を保持する"
                        />
                    )}
                />

                <ForgotPassword open={open} handleClose={handleClose} />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    color='info'
                >
                    {isLoading ? "ログイン中..." : "ログイン"}
                </Button>


                <Typography sx={{ textAlign: "center" }}>
                    アカウントを持っていませんか？{" "}
                    <Link component={RouterLink} to="/register">
                        登録はこちら
                    </Link>
                </Typography>
            </Box>
        </AuthCard>

    )
}

export default LoginCard