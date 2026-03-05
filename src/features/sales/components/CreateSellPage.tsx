import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material"
import Header from "../../../shared/components/layout/Header";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import { tokens } from "../../../shared/theme";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { SellOrderItem } from "../types/sell";
import SellRowItem from "./SellRowItem";
import * as yup from "yup";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { saleAPI } from "../api/saleAPI";
import type { CategorySummariesData } from "../../categories/types/category";
import { useCategorySummaries } from "../../categories/hooks/useCategorySummaries";
import { descriptionTextField } from "../../../shared/styles/descriptionTextField";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

/** 
 * 新規販売注文作成ページコンポーネント
 *
 * 顧客名、販売商品行（SKU、数量、単価、メモ）を入力し、
 * 保存または即時販売を行うことができる
 * 
 * バリデーションにはYupスキーマを使用しており、行ごとのエラー管理も実施
 * 注文確定時には確認ダイアログを表示してユーザーに確認を求める
 */

export type SellRow = {
    category: CategorySummariesData | null
    productId: number | null;
    sku: string | null;
    qty: number;
    price: number;
    note: string;
    stockQty?: number;
}

type DialogMode = "save" | "sell";

const sellRowSchema = yup.object({
    category: yup.object({
        id: yup.number().required(),
        categoryName: yup.string().required(),
    }).nullable().required("カテゴリーを選択してください").noUnknown(true),
    productId: yup.number().nullable().required("商品を選択してください"),
    sku: yup.string().nullable().required("SKUを選択してください"),
    qty: yup
        .number()
        .min(1)
        .test(
            "max-by-stock",
            "利用可能数量を超えています",
            function (value) {
                const { stockQty } = this.parent as SellRow;

                if (value == null || stockQty == null) return true;
                return value <= stockQty;
            }
        ),
    price: yup.number().min(1, "単価は1¥以上で入力してください").required(),
    note: yup.string().nullable(),
});
const rowsSchema = yup.array().of(sellRowSchema);

const CreateSellPage = () => {

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { showSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const { isSM } = useScreen();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // ステート
    const [customerName, setCustomerName] = useState<string>("");
    const [errorsByRow, setErrorsByRow] = useState<Record<number, Record<string, string>>>({});
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [description, setDescription] = useState("");

    // デフォルトの販売行データ
    const defaultItem: SellRow = {
        category: null,
        productId: null,
        sku: null,
        qty: 1,
        price: 0,
        note: ""
    }

    const [rows, setRows] = useState<SellRow[]>([defaultItem]);
    const [dialogMode, setDialogMode] = useState<DialogMode>("save");

    // カテゴリー一覧データ取得
    const { isLoading, error, data: categories = [] } = useCategorySummaries();

    // 指定行を更新
    const updateRow = (index: number, patch: Partial<SellRow>) => {
        // 行データの更新
        setRows(prev =>
            prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
        );
        // エラー状態のクリア
        setErrorsByRow(prev => {
            const newErrors = { ...prev };
            if (!newErrors[index]) return newErrors;

            if (patch.category) {
                delete newErrors[index].category;
                delete newErrors[index].productId;
                delete newErrors[index].sku;
                delete newErrors[index].qty;
                delete newErrors[index].price;
            }

            if (patch.productId) {
                delete newErrors[index].productId;
                delete newErrors[index].sku;
                delete newErrors[index].qty;
                delete newErrors[index].price;
            }

            if (patch.sku) {
                delete newErrors[index].sku;
                delete newErrors[index].qty;
                delete newErrors[index].price;
            }
            if (patch.qty) delete newErrors[index].qty;
            if (patch.price) delete newErrors[index].price;


            return newErrors;
        });
    };
    // 新しい販売行を追加
    const addRow = async () => {
        if (!(await validateRows())) return;
        setRows(prev => [
            ...prev,
            { category: null, productId: null, sku: null, qty: 1, price: 0, note: "" },
        ]);
    };

    // 指定行を削除
    const deleteRow = (index: number) => {
        if (rows.length === 1) {
            showSnackbar("最低1つの商品が必要です", "warning");
            return;
        }
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    // 入力中のデータからSellOrderItemを構築
    const buildSellItem = (): SellOrderItem | null => {
        if (!customerName.trim()) {
            showSnackbar("顧客名を入力してください", "error");
            return null;
        }

        return {
            customerName: customerName,
            description: "",
            details: rows
                .filter(row => row.sku !== null)
                .map(row => ({
                    productId: row.productId!,
                    sku: row.sku!,
                    qty: row.qty,
                    price: row.price,
                    note: row.note,
                })),
        };
    }

    // 保存前のバリデーション
    const validateRows = async (): Promise<boolean> => {
        if (!customerName.trim()) {
            showSnackbar("顧客名を入力してください", "error");
            return false;
        }

        if (rows.length === 0) {
            showSnackbar("商品を追加してください", "error");
            return false;
        }

        try {
            await rowsSchema.validate(rows, { abortEarly: false });
            setErrorsByRow({});
            return true;
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: Record<number, Record<string, string>> = {};

                err.inner.forEach(e => {
                    if (!e.path) return;

                    const parts = e.path.replace(/^\[\d+\]\./, '').split('.');
                    const field = parts.join('.');

                    const match = e.path.match(/^\[(\d+)\]/);
                    const rowIndex = match ? Number(match[1]) : 0;

                    if (!newErrors[rowIndex]) newErrors[rowIndex] = {};
                    newErrors[rowIndex][field] = e.message;

                });
                setErrorsByRow(newErrors);
            }
            return false;
        }
    };

    // 注文確定処理（即時発注）
    const handleSell = async () => {
        const sellItem = buildSellItem();
        if (!sellItem) return;

        try {
            const createdSaleOrder = await saleAPI.createSaleOrder(sellItem);
            await saleAPI.prepareSaleOrder(Number(createdSaleOrder.data.id));
            showSnackbar(SNACKBAR_MESSAGES.SELL.CREATE_SUCCESS, "success");

            const categoryIds = rows
                .map(row => row.category?.id)
                .filter((id): id is number => !!id);

            // リセット
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([defaultItem]);
            setCustomerName("");

            categoryIds.forEach(categoryId => {
                queryClient.invalidateQueries({
                    queryKey: ["supplierProductsByCategory", categoryId]
                });
            });
            navigate(`/sell-order/${createdSaleOrder.data.id}`);
        } catch (err) {
            showSnackbar(SNACKBAR_MESSAGES.SELL.CREATE_FAILED, "error");
        }
    };

    // 注文確認ダイアログでの保存
    const handleConfirmSave = async () => {
        if (!customerName.trim()) return;

        const sellItem: SellOrderItem = {
            customerName: customerName,
            description: "",
            details: rows
                .filter(row => row.sku !== null)
                .map(row => ({
                    productId: row.productId!,
                    sku: row.sku!,
                    qty: row.qty,
                    price: row.price,
                    note: row.note,
                })),
        };

        try {
            const savedSaleOrder = await saleAPI.createSaleOrder(sellItem);
            showSnackbar(SNACKBAR_MESSAGES.SAVE_SUCCESS, "success");

            // reset
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([defaultItem]);
            setCustomerName("");
            navigate(`/sell-order/${savedSaleOrder.data.id}`);
        } catch (e) {
            showSnackbar(SNACKBAR_MESSAGES.SAVE_FAILED, "error");
        }
    };

    // 合計金額計算
    const totalAmount = rows.reduce((sum, r) => {
        if (!r.sku) return sum;
        return sum + r.qty * r.price;
    }, 0);
    const validRows = rows.filter(r => r.sku);

    // キャンセル処理
    const handleCancel = () => {
        setRows([defaultItem]);
        setCustomerName("");
    }

    return (
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header
                        title="新規販売注文作成"
                        subtitle="新しい規販注文の詳細を入力してください"
                    />
                )}
                <Box mt={4}>
                    <Tooltip title="元に戻す">
                        <IconButton aria-label="元に戻す" color='info' onClick={() => {
                            window.history.back()
                        }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box mt={3} minHeight="75vh">
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {/* 顧客名入力欄 */}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={200} />
                ) : (
                    <Box m={2}>
                        <TextField
                            required
                            label="顧客名"
                            sx={{
                                minWidth: 340,
                                m: 1,
                                ...descriptionTextField
                            }}
                            value={customerName}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const name = event.target.value;
                                setCustomerName(name)

                            }}
                        />
                    </Box>
                )}

                {/* 商品行リスト */}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Grid container>
                        {rows.map((row, i) => (
                            <SellRowItem
                                key={i}
                                row={row}
                                index={i}
                                isLast={i === rows.length - 1}
                                categories={categories}
                                onUpdate={updateRow}
                                onAdd={addRow}
                                onDelete={deleteRow}
                                totalRows={rows.length}
                                customerName={customerName}
                                errors={errorsByRow[i]}
                            />
                        ))}
                    </Grid>
                )}

                {/* ボタン操作 */}
                <Stack
                    textAlign="center"
                    direction="row"
                    gap={1}
                    m={1}
                    width={340}
                    justifyContent="center"
                    sx={{
                        // display: productData?.length === 0 ? 'none' : 'flex'
                    }}
                >
                    <Button variant="contained" color="secondary" onClick={async () => {
                        if (!(await validateRows())) return;
                        setDialogMode("save")
                        setOpenConfirmDialog(true)
                    }}>保存</Button>

                    <Button variant="contained" color="success" onClick={async () => {
                        if (!(await validateRows())) return;
                        setDialogMode("sell")
                        setOpenConfirmDialog(true)
                    }} >販売</Button>

                    <Button variant="contained" color="warning" onClick={handleCancel}>キャンセル</Button>
                </Stack>
            </Box >

            {/* 注文確認ダイアログ */}
            < Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
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
                <DialogTitle>注文内容の確認 ({dialogMode === "save" ? "保存用" : "販売用"})</DialogTitle>

                <DialogContent dividers>
                    <Typography variant="h6" mb={1}>
                        販売商品一覧
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
                                <Box flex={3}>{row.sku}</Box>
                                <Box flex={1} textAlign="right">{row.qty}</Box>
                                <Box flex={1} textAlign="right">{row.price.toLocaleString()}</Box>
                                <Box flex={1} textAlign="right">{(row.qty * row.price).toLocaleString()}</Box>
                            </Stack>
                        ))}
                    </Box>

                    {/* 合計金額 */}
                    <Typography variant="h6" mt={2} mb={1} textAlign="right">
                        合計金額: <strong>{totalAmount.toLocaleString()} ¥</strong>
                    </Typography>

                    {/* 説明入力 */}
                    <TextField
                        label="説明"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={descriptionTextField}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                            setDescription("");
                            setOpenConfirmDialog(false)
                        }}
                    >
                        キャンセル
                    </Button>
                    <Button
                        variant="contained"
                        color={dialogMode === "save" ? "info" : "success"}
                        onClick={dialogMode === "save" ? handleConfirmSave : handleSell}
                    >
                        {dialogMode === "save" ? "保存" : "販売"}
                    </Button>
                </DialogActions>
            </Dialog >
        </Box >
    )
}

export default CreateSellPage