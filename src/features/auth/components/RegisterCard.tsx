import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { RegisterRequest } from "../types/auth";
import { type JSX } from "react";
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Link, Typography } from "@mui/material";
import { AuthCard, AuthTextField } from "../styles/AuthCardStyle";

/** 
 * 登録カードコンポーネント
 * 
 * ユーザーが新しいアカウントを作成するための登録フォームを表示するコンポーネント。
 * 名前、メールアドレス、パスワード、電話番号を入力し、登録を行う。
 * 
 * @param control - react-hook-formの`control`オブジェクト
 * @param errors - 入力フィールドのバリデーションエラー情報
 * @param onSubmit - フォーム送信時に呼ばれる関数
 * @param isLoading - ローディング状態を示すフラグ
 * @param handleSubmit - react-hook-formの`handleSubmit`関数
 * 
 * @returns JSX.Element - 登録カードのUIコンポーネント
 */
type CardRegisterProps = {
    control: Control<RegisterRequest>;
    errors: FieldErrors<RegisterRequest>;
    onSubmit: (data: RegisterRequest) => void;
    isLoading: boolean;
    handleSubmit: (callback: (data: RegisterRequest) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}
const RegisterCard = ({
    control,
    errors,
    onSubmit,
    handleSubmit,
    isLoading
}: CardRegisterProps): JSX.Element => {


    return (
        <AuthCard variant="outlined">
            {/* 登録カードのタイトル */}
            <Typography textAlign="center" component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
                登録
            </Typography>
            {/* フォームのラッパー */}
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)} // フォーム送信時に`onSubmit`を呼び出す
                sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 1 }}
            >
                <FormControl>
                    <FormLabel htmlFor="name">名前</FormLabel>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <AuthTextField
                                {...field}
                                id="name"
                                placeholder="Taro"
                                autoComplete="name"
                                fullWidth
                                autoFocus
                                variant="outlined"
                                color={errors.name ? "error" : "primary"}
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ' '}
                            />
                        )}
                    />
                </FormControl>

                {/* メールアドレス入力フィールド */}
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
                                fullWidth
                                variant="outlined"
                                color={errors.email ? "error" : "primary"}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ' '}
                            />
                        )}
                    />
                </FormControl>

                {/* パスワード入力フィールド */}
                <FormControl>
                    <FormLabel htmlFor="password">パスワード</FormLabel>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <AuthTextField
                                {...field}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                fullWidth
                                variant="outlined"
                                color={errors.password ? "error" : "primary"}
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : ' '}
                            />
                        )}
                    />
                </FormControl>

                {/* 電話番号入力フィールド */}
                <FormControl>
                    <FormLabel htmlFor="phoneNumber">電話番号</FormLabel>
                    <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                            <AuthTextField
                                {...field}
                                id="phoneNumber"
                                placeholder="0312345678"
                                autoComplete="tel"
                                fullWidth
                                variant="outlined"
                                color={errors.phoneNumber ? "error" : "primary"}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber ? errors.phoneNumber.message : ' '}
                            />
                        )}
                    />
                </FormControl>

                {/* 登録ボタン */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    color='info'
                >
                    {isLoading ? "登録中..." : "登録"}
                </Button>

                {/* ログインリンク */}
                <Typography sx={{ textAlign: "center" }}>
                    すでに会員の方は{" "}
                    <Link component={RouterLink} to="/login">
                        こちらからログイン
                    </Link>
                    してください
                </Typography>
            </Box>
        </AuthCard>
    )
}

export default RegisterCard