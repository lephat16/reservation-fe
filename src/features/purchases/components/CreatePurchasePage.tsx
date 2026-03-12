import {
    Box,
    Button,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    Tooltip,
    useTheme,
    type SelectChangeEvent
} from '@mui/material';
import { tokens } from '../../../shared/theme';
import type { SupplierData } from '../../suppliers/types/supplier';
import Header from '../../../shared/components/layout/Header';
import { useSnackbar } from '../../../shared/hooks/SnackbarContext';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ErrorState from '../../../shared/components/messages/ErrorState';
import { SNACKBAR_MESSAGES } from '../../../constants/message';
import { purchaseAPI } from '../api/purchaseAPI';
import type { PurchaseOrderItem, PurchaseRow } from '../types/purchase';
import { useAllSuppliers } from '../../suppliers/hooks/useAllSuppliers';
import { useSupplierProductsWithLeadTime } from '../../suppliers/hooks/useSupplierProductsWithLeadTime';
import { PurchaseItemRow } from './PurchaseItemRow';
import { PurchaseConfirmDialog } from './PurchaseConfirmDialog';
import { styledSelect } from '../../../shared/components/global/select/styledSelect';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ORDER_TYPE } from '../../../constants/order';
import { useQueryClient } from '@tanstack/react-query';
import { useScreen } from '../../../shared/hooks/ScreenContext';
/**
 * CreatePurchasePage コンポーネント
 *
 * 仕入先を選択し、商品の購入発注を作成・保存・即時発注するページ。
 * 
 * 主な機能:
 * - 仕入先選択
 * - 商品選択・数量・備考管理
 * - 発注の保存または即時発注
 * - 発注合計金額の計算
 * - 商品行の追加・削除
 *
 * @component
 */

export type DialogMode = "save" | "purchase";

const CreatePurchasePage = () => {

    //フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const location = useLocation();
    const { showSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const { preselectedSupplierId, preselectedSku } = location.state || {};
    const { isSM } = useScreen();
    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const navigate = useNavigate(); // ページ遷移用
    // ステート管理
    const [rows, setRows] = useState<PurchaseRow[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
    const [openSelectSupplier, setOpenSelectSupplier] = useState(false);

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [description, setDescription] = useState("");
    const [dialogMode, setDialogMode] = useState<DialogMode>("save");

    // 仕入先選択用ハンドラー
    const handleCloseSelectSupplier = () => setOpenSelectSupplier(false);
    const handleOpenSelectSupplier = () => setOpenSelectSupplier(true);

    // APIクエリ: 仕入先一覧取得
    const { isLoading, error, data } = useAllSuppliers();

    // APIクエリ: 商品一覧取得
    // 選択した仕入先に紐づく商品の取得
    const { isLoading: isLoadingProducts, error: productError, data: productData } = useSupplierProductsWithLeadTime(selectedSupplier)

    // ページロード時にプリセットされた仕入先を選択
    useEffect(() => {
        if (!data || !preselectedSupplierId) return;

        const preSupplier = data.find(s => s.id === Number(preselectedSupplierId)) || null;
        setSelectedSupplier(preSupplier);

    }, [data, preselectedSupplierId]);

    // ページロード時にプリセットされたSKUの行を追加
    useEffect(() => {
        if (!productData || !preselectedSku) return;

        const preProduct = productData.find(p => p.sku === preselectedSku) || null;
        if (preProduct) {
            setRows([{ product: preProduct, qty: 1, note: "" }]);
        }
    }, [productData, preselectedSku]);

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

    // 発注データ構築
    const buildPurchaseItem = (): PurchaseOrderItem | null => {
        if (!selectedSupplier) return null;

        return {
            supplierId: selectedSupplier.id ?? 0,
            description,
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

    // 発注確定処理（即時発注）
    const handlePurchase = async () => {
        const purchaseItem = buildPurchaseItem();
        if (!purchaseItem) return;

        try {
            const createdPurchaseOrder = await purchaseAPI.createPurchaseOrder(purchaseItem);
            await purchaseAPI.placePurchaseOrder(Number(createdPurchaseOrder.data.id));
            showSnackbar(SNACKBAR_MESSAGES.ORDER.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });  // 通知データを再取得
            // リセット
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([]);
            setSelectedSupplier(null);
            navigate(`/purchase-order/${createdPurchaseOrder.data.id}`);
        } catch (err) {
            showSnackbar(SNACKBAR_MESSAGES.ORDER.CREATE_FAILED, "error");
        }
    };

    // 発注確認ダイアログでの保存
    const handleConfirmSave = async () => {
        if (!selectedSupplier) return;
        const purchaseItem: PurchaseOrderItem = {
            supplierId: selectedSupplier.id ?? 0,
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
            const savedPurchaseOrder = await purchaseAPI.createPurchaseOrder(purchaseItem);
            showSnackbar(SNACKBAR_MESSAGES.SAVE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });  // 通知データを再取得

            // リセットステート
            setOpenConfirmDialog(false);
            setDescription("");
            setRows([]);
            setSelectedSupplier(null);
            navigate(`/purchase-order/${savedPurchaseOrder.data.id}`);
        } catch (e) {
            showSnackbar(SNACKBAR_MESSAGES.SAVE_FAILED, "error");
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

    const updateQty = (index: number, qty: number) => {
        setRows(prev =>
            prev.map((r, i) =>
                i === index ? { ...r, qty } : r
            )
        );
    };

    const updateNote = (index: number, note: string) => {
        setRows(prev =>
            prev.map((r, i) =>
                i === index ? { ...r, note } : r
            )
        );
    };
    return (
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header
                        title="新規発注作成"
                        subtitle="新しい発注の詳細を入力してください"
                    />
                )}
                {!isSM && <Box mt={4}>
                    <Tooltip title="元に戻す">
                        <IconButton aria-label="元に戻す" color='info' onClick={() => {
                            window.history.back()
                        }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>}
            </Box>
            <Box minHeight="75vh" >
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {/* 仕入先選択 */}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Box sx={{ my: { sm: 1 }, mx: 1 }}>
                        <Button
                            sx={{ display: 'block', ml: 1 }}
                            color="secondary"
                            onClick={handleOpenSelectSupplier}
                        >
                            仕入先を選択
                        </Button>
                        <FormControl sx={{ m: 1, minWidth: { xs: 290, sm: 340 } }}>
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
                                sx={styledSelect}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: colors.blueAccent[900],
                                            color: colors.grey[100],
                                            minWidth: 200,
                                            boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                                        }
                                    }
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
                )}
                {/* 選択中の仕入先がある場合、商品行を表示 */}
                {selectedSupplier && (
                    <Box m={1} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {rows.map((row, i) => (
                                <PurchaseItemRow
                                    key={i}
                                    index={i}
                                    row={row}
                                    rows={rows}
                                    selectedSupplier={selectedSupplier}
                                    productData={productData}
                                    isLoadingProducts={isLoadingProducts}
                                    productError={productError}
                                    onProductChange={handleProductChange}
                                    onQtyChange={(i, qty) => updateQty(i, qty)}
                                    onNoteChange={(i, note) => updateNote(i, note)}
                                    onAddRow={addRow}
                                    onDeleteRow={handleDeleteRow}
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
                            }}>{ORDER_TYPE.PURCHASE.label}</Button>

                            <Button variant="contained" color="warning" onClick={handleCancel}>キャンセル</Button>
                        </Stack>
                    </Box>
                )}
            </Box>
            {/* 発注確認ダイアログ */}
            <PurchaseConfirmDialog
                open={openConfirmDialog}
                dialogMode={dialogMode}
                validRows={validRows}
                totalAmount={totalAmount}
                description={description}
                onClose={() => {
                    setDescription("");
                    setOpenConfirmDialog(false);
                }}
                onDescriptionChange={setDescription}
                onConfirmSave={handleConfirmSave}
                onConfirmPurchase={handlePurchase}
            />
        </Box >
    )
}

export default CreatePurchasePage