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

    const {
        control,
        handleSubmit,
        formState: { errors }, reset
    } = useForm<ForgotPasswordForm>({
        resolver: yupResolver(schema),
        mode: "onBlur",
        defaultValues: {
            email: "",
        }
    });

    const sendMutation = useMutation({
        mutationFn: async (email: string) => {
            const response = await userAPI.sendPasswordTokenEmail(email);
            return response;
        },
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.SEND_REQUEST_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["category-summaries"] });
        },
        onError: (error: unknown) => {
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
                                reset();
                                handleClose();
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
                <DialogContentText>
                    アカウントのメールアドレスを入力してください。リセット用のリンクをお送りします。
                </DialogContentText>
                <FormControl variant="outlined" fullWidth>

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
                <Button variant="contained" type="submit">
                    続行
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default ForgotPassword