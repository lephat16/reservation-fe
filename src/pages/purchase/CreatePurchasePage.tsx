import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography, useTheme, type SelectChangeEvent } from '@mui/material';
import { tokens } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import ApiService from '../../services/ApiService';
import type { SupplierData, SupplierProductData } from '../../types/supplier';
import Header from '../../layout/Header';
import CustomSnackbar from '../../components/customSnackbar/CustomSnackbar';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useState } from 'react';
import NumberField from '../../components/fields/NumberField';
import type { PurchaseOrderItem } from '../../types';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';

type PurchaseRow = {
    product: SupplierProductData | null;
    qty: number;
    note: string;
};

type DialogMode = "save" | "purchase";

const CreatePurchasePage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // ステート管理
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
    const [openSelectSupplier, setOpenSelectSupplier] = useState(false);

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [description, setDescription] = useState("");

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const [rows, setRows] = useState<PurchaseRow[]>([]);

    // 仕入先選択用ハンドラー
    const handleCloseSelectSupplier = () => setOpenSelectSupplier(false);
    const handleOpenSelectSupplier = () => setOpenSelectSupplier(true);

    const [dialogMode, setDialogMode] = useState<DialogMode>("save");

    // APIクエリ: 仕入先一覧取得
    const { isLoading, error, data } = useQuery<SupplierData[]>({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const resSuppliers = await ApiService.getAllSuppliers();
            return resSuppliers.data;
        },
    });

    // APIクエリ: 商品一覧取得
    // 選択した仕入先に紐づく商品の取得
    const { isLoading: isLoadingProducts, error: productError, data: productData } = useQuery<SupplierProductData[]>({
        queryKey: ["supplierProducts", selectedSupplier?.id],
        queryFn: async () => {
            const resProducts = await ApiService.getSupplierProductsWithLeadTime(Number(selectedSupplier?.id));
            return resProducts.data?.[0]?.products || [];
        },
        enabled: !!selectedSupplier  // 仕入先が選択されている場合のみ実行
    });

    // 仕入先変更時
    const handleSupplierChange = (event: SelectChangeEvent<number>) => {
        const selectedSupplier = data?.find(s => s.id === Number(event.target.value)) || null;
        setSelectedSupplier(selectedSupplier);
        // 新しい仕入先選択時は最初の行を初期化
        setRows([{ product: null, qty: 1, note: "" }]);

    };

    // 商品選択変更
    const handleProductChange = (index: number, productId: number) => {
        const product = productData?.find(p => p.id === productId) || null;

        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, product } : row
            )
        );
    };

    // 新しい商品行の追加
    const addRow = () => {
        if (rows.some(r => !r.product)) {
            showSnackbar("商品を選択してください", "error");
            return;
        }
        setRows(prev => [
            ...prev,
            { product: null, qty: 1, note: "" }
        ]);
    };

    // 注文データ構築
    const buildPurchaseItem = (): PurchaseOrderItem | null => {
        if (!selectedSupplier) return null;

        return {
            supplierId: selectedSupplier.id,
            description: "",
            details: rows
                .filter(row => row.product !== null)
                .map(row => ({
                    productId: row.product!.id,
                    qty: row.qty,
                    cost: row.product!.price,
                    note: row.note,
                })),
        };
    };

    // 保存前のバリデーション
    const validateBeforeSave = (): boolean => {
        if (!selectedSupplier) {
            showSnackbar("仕入先を選択してください", "error");
            return false;
        }

        if (rows.length === 0) {
            showSnackbar("商品を追加してください", "error");
            return false;
        }

        if (rows.some(r => !r.product)) {
            showSnackbar("すべての商品を選択してください", "error");
            return false;
        }

        return true;
    };

    // 注文確定処理（即時発注）
    const handlePurchase = async () => {
        const purchaseItem = buildPurchaseItem();
        if (!purchaseItem) return;

        try {
            const createdPurchaseOrder = await ApiService.createPurchaseOrder(purchaseItem);
            await ApiService.placeOrder(Number(createdPurchaseOrder.data.id));
            console.log(purchaseItem);
            showSnackbar("注文に成功しました", "success");

            // リセット
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([]);
            setSelectedSupplier(null);
        } catch (err) {
            showSnackbar("注文に失敗しました", "error");
        }
    };

    // 注文確認ダイアログでの保存
    const handleConfirmSave = async () => {
        if (!selectedSupplier) return;
        const purchaseItem: PurchaseOrderItem = {
            supplierId: selectedSupplier.id,
            description,
            details: rows
                .filter(r => r.product)
                .map(r => ({
                    productId: r.product!.id,
                    qty: r.qty,
                    cost: r.product!.price,
                    note: r.note,
                })),
        };

        try {
            await ApiService.createPurchaseOrder(purchaseItem);
            console.log(purchaseItem);
            showSnackbar("注文を保存しました", "success");

            // reset
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([]);
            setSelectedSupplier(null);
        } catch (e) {
            showSnackbar("保存に失敗しました", "error");
        }
    };

    // 合計金額計算
    const totalAmount = rows.reduce((sum, r) => {
        if (!r.product) return sum;
        return sum + r.qty * r.product.price;
    }, 0);
    const validRows = rows.filter(r => r.product);

    // 商品行削除
    const handleDeleteRow = (index: number) => {
        if (rows.length === 1) {
            showSnackbar("最低1つの商品が必要です", "warning");
            return;
        }

        setRows(prev => prev.filter((_, i) => i !== index));
    };

    // キャンセル処理
    const handleCancel = () => {
        setRows([]);
        setSelectedSupplier(null);
    }
    return (
        <Box m={3}>
            <Header
                title="新規注文作成"
                subtitle="新しい注文の詳細を入力してください"
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

                {/* 仕入先選択 */}
                <Box m={1}>
                    <Button
                        sx={{ display: 'block', mt: 2, ml: 1 }}
                        color="secondary"
                        onClick={handleOpenSelectSupplier}
                    >
                        仕入先を選択
                    </Button>
                    <FormControl sx={{ m: 1, minWidth: 340 }}>
                        <InputLabel
                            id="controlled-open-select-suppliers-label"
                            sx={{
                                color: colors.grey[100],
                                '&.Mui-focused': {
                                    color: colors.grey[200],
                                },
                            }}
                        >
                            仕入先</InputLabel>
                        <Select
                            labelId="controlled-open-select-suppliers-label"
                            id="controlled-open-select-suppliers"
                            open={openSelectSupplier}
                            onClose={handleCloseSelectSupplier}
                            onOpen={handleOpenSelectSupplier}
                            value={selectedSupplier?.id || ''}
                            label="仕入先"
                            onChange={handleSupplierChange}
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.grey[600],
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.grey[400],
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.grey[200],
                                },


                            }}
                        >

                            {data?.map((supplier) => (
                                <MenuItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}

                        </Select>
                    </FormControl>
                </Box>

                {/* 選択中の仕入先がある場合、商品行を表示 */}
                {selectedSupplier && (
                    <Box m={1} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {rows.map((row, i) => (
                                <Box key={i}>
                                    {/* 仕入先名と住所 */}
                                    <Stack m={1} direction={'row'} gap={3}>
                                        <Typography variant="h6">{selectedSupplier.name}</Typography>
                                        <Typography variant="h6">[{selectedSupplier.address}]</Typography>
                                    </Stack>

                                    {/* 商品選択 */}
                                    {isLoadingProducts ? (
                                        <CircularProgress />
                                    ) : productError ? (
                                        <Typography color="error">商品データの取得に失敗しました</Typography>
                                    ) : productData?.length === 0 ? (
                                        <Typography color="warning" ml={1}>選択可能な商品はありません</Typography>
                                    ) : (
                                        <FormControl sx={{ m: 1, minWidth: 340 }}>
                                            <InputLabel
                                                id={`controlled-open-select-products-label-${i}`}
                                                sx={{
                                                    color: colors.grey[100],
                                                    '&.Mui-focused': {
                                                        color: colors.grey[200],
                                                    },
                                                }}
                                            >
                                                商品名</InputLabel>
                                            <Select
                                                labelId={`controlled-open-select-products-label-${i}`}
                                                id={`controlled-open-select-products-${i}`}

                                                value={row.product?.id || ''}
                                                label="商品名"
                                                onChange={(event) =>
                                                    handleProductChange(i, Number(event.target.value))
                                                }
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: colors.grey[600],
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: colors.grey[400],
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: colors.grey[200],
                                                    },


                                                }}
                                            >
                                                {productData?.map((p) => (
                                                    <MenuItem key={p.id} value={p.id}>
                                                        {p.product}
                                                    </MenuItem>
                                                ))}

                                            </Select>
                                        </FormControl>
                                    )}

                                    {/* 選択された商品の詳細 */}
                                    {row.product && (
                                        <Box
                                            border={1}
                                            borderRadius={1}
                                            m={1}
                                            p={2}
                                            key={row.product?.id}
                                            width="340px"
                                            sx={{
                                                borderColor: colors.grey[400],
                                                position: "relative"
                                            }}
                                        >
                                            {/* 削除ボタン */}

                                            <Stack
                                                direction="row"
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 2,
                                                    right: 8,
                                                }}
                                            >
                                                {rows.length > 1 && (
                                                    <Tooltip title="削除">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteRow(i)}

                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="追加">
                                                    <IconButton
                                                        size="small"
                                                        onClick={addRow}

                                                    >
                                                        <AddCircleIcon />
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>


                                            <Typography variant="h6" textAlign="center" mb={2}>{row.product.product}</Typography>

                                            <Box mb={2}>
                                                <Typography>商品ID: <strong>{row.product.id}</strong></Typography>
                                                <Typography mb={2}>価格: <strong>{row.product.price}</strong></Typography>

                                                {/* 数量と小計 */}
                                                <Stack direction="row" gap={2}>
                                                    <NumberField
                                                        label="数量"
                                                        value={row.qty}
                                                        onValueChange={(v) =>
                                                            setRows(prev =>
                                                                prev.map((r, rowI) => rowI === i ? { ...r, qty: v ?? 1 } : r)
                                                            )
                                                        }
                                                        min={1}
                                                        max={500}
                                                    />

                                                    <TextField
                                                        label="合計"
                                                        value={`${row.qty * row.product.price} ¥`}

                                                        slotProps={{
                                                            input: {
                                                                readOnly: true,
                                                            },
                                                        }}
                                                        sx={{
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
                                                    />
                                                </Stack>
                                                <Typography mt={2}>リードタイム: <strong>{row.product.leadTime}日</strong></Typography>
                                            </Box>

                                            {/* メモ入力 */}
                                            <TextField
                                                label="ノート"
                                                variant="outlined"
                                                fullWidth
                                                multiline
                                                rows={4}
                                                sx={{
                                                    marginBottom: 2,
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
                                                value={row.note}
                                                onChange={(e) =>
                                                    setRows(prev =>
                                                        prev.map((r, rowI) => rowI === i ? { ...r, note: e.target.value } : r)
                                                    )
                                                }
                                            />
                                        </Box>
                                    )}
                                </Box>
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
                                display: productData?.length === 0 ? 'none' : 'flex'
                            }}
                        >

                            <Button variant="contained" color="secondary" onClick={() => {
                                if (!validateBeforeSave()) return;
                                setDialogMode("save");
                                setOpenConfirmDialog(true);
                            }}>保存</Button>

                            <Button variant="contained" color="success" onClick={() => {
                                if (!validateBeforeSave()) return;
                                setDialogMode("purchase");
                                setOpenConfirmDialog(true);
                            }}>注文</Button>

                            <Button variant="contained" color="warning" onClick={handleCancel}>キャンセル</Button>
                        </Stack>
                    </Box>
                )}
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
                <DialogTitle>
                    注文内容の確認 ({dialogMode === "save" ? "保存用" : "購入用"})
                </DialogTitle>

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
                        onClick={dialogMode === "save" ? handleConfirmSave : handlePurchase}
                    >
                        {dialogMode === "save" ? "保存" : "注文"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CreatePurchasePage