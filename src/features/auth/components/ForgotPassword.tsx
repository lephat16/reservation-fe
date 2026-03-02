import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TextField, useTheme } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { userAPI } from "../../user/api/userAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";

/** 
 * パスワードリセットダイアログコンポーネント
 * 
 * ユーザーがメールアドレスを入力してパスワードリセットリンクを送信するためのダイアログ。
 * 
 * @param open - ダイアログが開いているかどうかを示すフラグ
 * @param handleClose - ダイアログを閉じるための関数
 * 
 * @returns JSX.Element - パスワードリセットフォームのダイアログコンポーネント
 */

type ForgotPasswordForm = {
    email: string;
};

const schema = yup.object({
    email: yup
        .string()
        .email("有効なメールアドレスを入力してください。")
        .required("メールアドレスは必須です。"),
});

type ForgotPasswordProps = {
    open: boolean;
    handleClose: () => void;
}
const ForgotPassword = ({ open, handleClose }: ForgotPasswordProps) => {

    const theme = useTheme();
    const queryClient = useQueryClient();

    const { showSnackbar } = useSnackbar();

    // フォームの初期化とバリデーション設定
    const {
        control,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<ForgotPasswordForm>({
        resolver: yupResolver(schema),
        mode: "onBlur", // フォームフィールドのフォーカスが外れたタイミングでバリデーション
        defaultValues: {
            email: "",
        }
    });

    // メール送信のmutation
    const sendMutation = useMutation({
        mutationFn: async (email: string) => {
            const response = await userAPI.sendPasswordTokenEmail(email);
            return response;
        },
        onSuccess: (response) => {
            // 成功時にスナックバーで成功メッセージを表示
            showSnackbar(response.message || SNACKBAR_MESSAGES.SEND_REQUEST_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["category-summaries"] });
        },
        onError: (error: unknown) => {
            // エラー時にスナックバーでエラーメッセージを表示
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.SEND_REQUEST_FAILED, "error");
        }
    });
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit((data) => {
                        sendMutation.mutate(data.email, {
                            onSuccess: () => {
                                reset(); // フォームをリセット
                                handleClose(); // ダイアログを閉じる
                            }
                        });
                    }),
                    sx: { backgroundColor: theme.alpha(blueGrey[700], 1) },
                },
            }}
        >
            <DialogTitle>パスワードをリセット</DialogTitle>
            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
            >
                {/* ユーザーにパスワードリセット用リンクを送る説明 */}
                <DialogContentText>
                    アカウントのメールアドレスを入力してください。リセット用のリンクをお送りします。
                </DialogContentText>
                <FormControl variant="outlined" fullWidth>

                    {/* メールアドレス入力フィールド */}
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id="email"
                                name="email"
                                label="メールアドレス"
                                // autoFocus
                                fullWidth
                                color={errors.email ? "error" : "primary"}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ' '}
                            />
                        )}

                    />
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleClose}>キャンセル</Button>

                {/* フォーム送信ボタン */}
                <Button variant="contained" type="submit">
                    続行
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ForgotPassword