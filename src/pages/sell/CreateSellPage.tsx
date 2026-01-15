import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography, useTheme, type SelectChangeEvent } from "@mui/material"
import Header from "../../layout/Header"
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar"
import { useSnackbar } from "../../hooks/useSnackbar";
import { tokens } from "../../theme";
import ApiService from "../../services/ApiService";
import type { CategorySummariesData } from "../../types/category";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { SellOrderItem } from "../../types";
import SellRowItem from "../../components/rowItem/SellRowItem";
import * as yup from "yup";

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
            "在庫数を超えています",
            function (value) {
                const { stockQty } = this.parent as SellRow;

                if (value == null || stockQty == null) return true;
                return value <= stockQty;
            }
        ),
    price: yup.number().min(1, "価格は1¥以上で入力してください").required(),
    note: yup.string().nullable(),
});
const rowsSchema = yup.array().of(sellRowSchema);

const CreateSellPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const [customerName, setCustomerName] = useState<string>("");

    const [errorsByRow, setErrorsByRow] = useState<Record<number, Record<string, string>>>({});

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [description, setDescription] = useState("");
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

    const { isLoading, error, data: categories = [] } = useQuery<CategorySummariesData[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const resCategories = await ApiService.getAllCategorySummaries();

            return resCategories.data;
        },
    });

    const updateRow = (index: number, patch: Partial<SellRow>) => {
        setRows(prev =>
            prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
        );
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
    const addRow = async () => {
        if (!(await validateRows())) return;
        setRows(prev => [
            ...prev,
            { category: null, productId: null, sku: null, qty: 1, price: 0, note: "" },
        ]);
    };

    const deleteRow = (index: number) => {
        if (rows.length === 1) {
            showSnackbar("最低1つの商品が必要です", "warning");
            return;
        }
        setRows(prev => prev.filter((_, i) => i !== index));
    };

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

    // const errorsByRow: Record<number, Record<string, string>> = {};

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

        // try {
        //     await Promise.all(
        //         rows.map(row =>
        //             sellRowSchema.validate(row, { abortEarly: false })));
        //     return true;
        // } catch (err) {
        //     if (err instanceof yup.ValidationError) {
        //         showSnackbar(err.errors[0], "error");
        //     }
        //     return false;
        // }

        try {
            await rowsSchema.validate(rows, { abortEarly: false });
            setErrorsByRow({});
            return true;
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: Record<number, Record<string, string>> = {};

                err.inner.forEach(e => {
                    if (!e.path) return;
                    // const parts = e.path.split('.');
                    // let rowIndex: number;
                    // let field: string;
                    // if (!isNaN(Number(parts[0]))) {
                    //     rowIndex = Number(parts[0]);
                    //     field = parts.slice(1).join('.');
                    // } else {
                    //     rowIndex = 0;
                    //     field = e.path;
                    // }
                    // if (!errorsByRow[rowIndex]) errorsByRow[rowIndex] = {};
                    // errorsByRow[rowIndex][field] = e.message;
                    // remove array index nếu có
                    const parts = e.path.replace(/^\[\d+\]\./, '').split('.');
                    const field = parts.join('.');

                    // tách index row
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
            // const createdPurchaseOrder = await ApiService.createPurchaseOrder(sellItem);
            // await ApiService.placeOrder(Number(createdPurchaseOrder.data.id));
            console.log(sellItem);
            showSnackbar("注文を保存しました", "success");

            // リセット
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([defaultItem]);
            setCustomerName("");
        } catch (err) {
            showSnackbar("保存に失敗しました", "error");
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
            // await ApiService.createPurchaseOrder(sellItem);
            console.log(sellItem);
            showSnackbar("注文を保存しました", "success");

            // reset
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([defaultItem]);
            setCustomerName("");
        } catch (e) {
            showSnackbar("保存に失敗しました", "error");
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
        <Box m={3}>
            <Header
                title="新規販売注文作成"
                subtitle="新しい規販注文の詳細を入力してください"
            />
            <Box mt={3} minHeight="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />
                {/* ローディング表示 */}
                {(isLoading) && (
                    <Box textAlign="center" my={4}>
                        <CircularProgress />
                        <Typography>データを読み込み中...</Typography>
                    </Box>
                )}
                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}

                <Box m={2}>
                    <TextField
                        required
                        label="顧客名"
                        sx={{
                            minWidth: 340,
                            m: 1,
                            '& .MuiInputLabel-root': {
                                color: colors.grey[100],
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: colors.grey[200],
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: colors.grey[600],
                                },
                                '&:hover fieldset': {
                                    borderColor: colors.grey[400],
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: colors.grey[200],
                                },
                            },
                            '& .MuiOutlinedInput-input': {
                                color: colors.grey[100],
                            },
                        }}
                        value={customerName}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const name = event.target.value;
                            setCustomerName(name)

                        }}
                    />
                </Box>

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
            </Box>

            {/* 注文確認ダイアログ */}
            <Dialog
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

                <DialogContent
                    dividers
                    sx={{
                        "& .MuiTextField-root": {
                            marginBottom: 2,
                            "& .MuiInputLabel-root": { color: colors.grey[100] },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: colors.primary[200] },
                                "&:hover fieldset": { borderColor: colors.primary[300] },
                                "&.Mui-focused fieldset": { borderColor: colors.primary[200] }
                            },
                        }
                    }}
                >

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
                        sx={{
                            '& .MuiInputLabel-root': {
                                color: colors.grey[100],
                                fontWeight: 600
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: colors.grey[200],
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: colors.grey[600],
                                },
                                '&:hover fieldset': {
                                    borderColor: colors.grey[400],
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: colors.grey[200],
                                },
                            },
                            '& .MuiOutlinedInput-input': {
                                color: colors.grey[100],
                            },
                        }}
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
            </Dialog>
        </Box>
    )
}

export default CreateSellPage