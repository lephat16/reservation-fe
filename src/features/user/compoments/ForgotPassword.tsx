import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, OutlinedInput, useTheme } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { userAPI } from "../api/userAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useState } from "react";

type ForgotPasswordProps = {
    open: boolean;
    handleClose: () => void;
}
const ForgotPassword = ({ open, handleClose }: ForgotPasswordProps) => {

    const theme = useTheme();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
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
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleClose();
                        sendMutation.mutate(email);
                    },
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
                <OutlinedInput
                    autoFocus
                    margin="dense"
                    id="email"
                    name="email"
                    label="メールアドレス"
                    placeholder="メールアドレス"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleClose}>キャンセル</Button>
                <Button variant="contained" type="submit">
                    続行
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ForgotPassword