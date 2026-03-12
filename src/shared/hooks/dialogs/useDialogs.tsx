import { useContext, useEffect, useState } from "react";
import DialogsContext from "./DialogsContext";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { tokens } from "../../theme";

export function useDialogs() {
    const context = useContext(DialogsContext);

    if (!context) {
        throw new Error("useDialogsはDialogsProvider内で使用する必要があります");
    }
    return context;
}

type DeleteConfirmProps = {
    open: boolean;
    title?: string;
    message: string;
    onClose: (result: boolean) => void;
}

export function DeleteConfirmDialog({
    open,
    title = "確認",
    message,
    onClose,
}: DeleteConfirmProps) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Dialog
            open={open}
            onClose={() => onClose(false)}
            slotProps={{
                paper: {
                    sx: { backgroundColor: colors.blueAccent[700] }
                }
            }}
            disableRestoreFocus
        >
            <DialogTitle
                sx={{
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center"
                }}
            >{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button size="small" variant="contained" onClick={() => onClose(false)}>キャンセル</Button>
                <Button size="small" variant="contained" color="error" onClick={() => onClose(true)}>
                    削除
                </Button>
            </DialogActions>
        </Dialog>
    );
}

type EditConfirmProps<T> = {
    open: boolean;
    title?: string;
    data: T | null;
    onClose: (result: T | null) => void;
}

export function EditConfirmDialog<T extends { name: string }>({
    open,
    data,
    onClose,
}: EditConfirmProps<T>) {

    const [name, setName] = useState(data?.name ?? "");

    useEffect(() => {
        setName(data?.name ?? "");
    }, [data]);

    const handleSave = () => {
        if (!data) return;
        onClose({ ...data, name });
    };

    return (
        <Dialog
            open={open}
            onClose={() => onClose(null)}
            slotProps={{
                paper: {
                    // sx: { backgroundColor: theme.alpha(blueGrey[700], 1) }
                }
            }}
        >
            <DialogTitle>編集</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(null)}>
                    キャンセル
                </Button>
                <Button onClick={handleSave}>
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
}