import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, OutlinedInput, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import { blue, blueGrey } from "@mui/material/colors";

type ForgotPasswordProps = {
    open: boolean;
    handleClose: () => void;
}
const ForgotPassword = ({ open, handleClose }: ForgotPasswordProps) => {
    const theme = useTheme();
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
                    },
                    sx: { backgroundColor: theme.alpha(blueGrey[700], 1)},
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