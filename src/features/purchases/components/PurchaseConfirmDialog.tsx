import { Box, Button, Dialog, DialogActions, DialogTitle, Stack, TextField, Typography, useTheme } from "@mui/material";
import type { PurchaseRow } from "../types/purchase";
import { tokens } from "../../../shared/theme";
import type { DialogMode } from "./CreatePurchasePage";
import { StyledDialogContent } from "../../../shared/components/global/StyledDialogContent";
import { descriptionTextField } from "../../../shared/styles/descriptionTextField";


type DialogProps = {
    open: boolean,
    onClose: () => void,
    dialogMode: DialogMode,
    validRows: PurchaseRow[],
    totalAmount: number,
    description: string,
    onDescriptionChange: (value: string) => void,
    onConfirmSave: () => void;
    onConfirmPurchase: () => void;
}

export const PurchaseConfirmDialog = ({
    open,
    dialogMode,
    validRows,
    totalAmount,
    description,
    onClose,
    onDescriptionChange,
    onConfirmSave,
    onConfirmPurchase,
}: DialogProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.blueAccent[900],
                        borderRadius: 2,
                        p: 2,
                    }
                }
            }}
        >
            <DialogTitle>
                注文内容の確認 ({dialogMode === "save" ? "保存用" : "購入用"})
            </DialogTitle>

            <StyledDialogContent dividers>
                <Typography variant="h6" mb={1}>
                    注文商品一覧
                </Typography>

                <Box
                    border={1}
                    borderRadius={1}
                    sx={{ borderColor: colors.grey[400], overflowX: 'auto' }}
                >
                    {/* ヘッダー */}
                    <Stack direction="row" p={1} sx={{ fontWeight: "bold" }}>
                        <Box flex={3}>商品名</Box>
                        <Box flex={1} textAlign="right">数量</Box>
                        <Box flex={1} textAlign="right">単価</Box>
                        <Box flex={1} textAlign="right">小計</Box>
                    </Stack>

                    {/* 注文行 */}
                    {validRows.map((row, index) => (
                        <Stack
                            key={index}
                            direction="row"
                            p={1}
                            sx={{ borderTop: "1px solid", borderColor: colors.grey[700] }}
                        >
                            <Box flex={3}>{row.product!.product}</Box>
                            <Box flex={1} textAlign="right">{row.qty}</Box>
                            <Box flex={1} textAlign="right">{row.product!.price.toLocaleString()}</Box>
                            <Box flex={1} textAlign="right">{(row.qty * row.product!.price).toLocaleString()}</Box>
                        </Stack>
                    ))}
                </Box>

                {/* 合計金額 */}
                <Typography variant="h6" mt={2} textAlign="right">
                    合計金額: <strong>{totalAmount.toLocaleString()} ¥</strong>
                </Typography>

                {/* 説明入力 */}
                <TextField
                    label="説明"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    sx={descriptionTextField}
                />
            </StyledDialogContent>

            <DialogActions>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={onClose}
                >
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    color={dialogMode === "save" ? "info" : "success"}
                    onClick={dialogMode === "save" ? onConfirmSave : onConfirmPurchase}
                >
                    {dialogMode === "save" ? "保存" : "注文"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}