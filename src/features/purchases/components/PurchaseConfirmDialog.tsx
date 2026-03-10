import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import type { PurchaseRow } from "../types/purchase";
import { tokens } from "../../../shared/theme";
import type { DialogMode } from "./CreatePurchasePage";
import { descriptionTextField } from "../../../shared/styles/descriptionTextField";
import { ORDER_TYPE } from "../../../constants/order";

/**
 * 発注確認ダイアログコンポーネント
 * 
 * 発注行の一覧、合計金額、説明入力を表示し、
 * 保存または即時発注を実行できる。
 * 
 * @param open - ダイアログの表示状態
 * @param onClose - ダイアログを閉じるコールバック
 * @param dialogMode - "save" または "purchase" のモード
 * @param validRows - 発注対象の行データ配列
 * @param totalAmount - 発注の合計金額
 * @param description - 説明文の状態
 * @param onDescriptionChange - 説明文変更時のコールバック
 * @param onConfirmSave - 保存ボタン押下時のコールバック
 * @param onConfirmPurchase - 発注ボタン押下時のコールバック
 */

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
            <DialogTitle textAlign="center" variant="h4" fontWeight="bold">
                発注内容の確認 ({dialogMode === "save" ? "保存用" : "発注用"})
            </DialogTitle>

            <DialogContent dividers>
                <Typography variant="h6" mb={1}>
                    発注商品一覧
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

                    {/* 発注行 */}
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
            </DialogContent>

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
                    {dialogMode === "save" ? "保存" : `${ORDER_TYPE.PURCHASE.label}`}
                </Button>
            </DialogActions>
        </Dialog>
    )
}