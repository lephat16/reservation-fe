import { tokens } from '../theme';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme } from '@mui/material';

type DeleteConfirmDialogProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    targetName?: string;
    onDelete: () => void;
    isDeleting: boolean;
}

export const DeleteConfirmDialog = ({
    open,
    onClose,
    title,
    targetName,
    onDelete,
    isDeleting

}: DeleteConfirmDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.blueAccent[900], borderRadius: 2, p: 2 } }
            }}
        >
            <DialogTitle>{title ? `${title}削除確認` : "商品削除確認"}</DialogTitle>
            <DialogContent>
                <Typography>
                    {targetName ? `${targetName}` : "この商品"} を本当に削除しますか？この操作は取り消せません。
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="inherit" onClick={onClose}>
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "削除中..." : "削除"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}