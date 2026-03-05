import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { tokens } from "../../../shared/theme";
import Header from "../../../shared/components/layout/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PurchaseOrderData, } from "../types/purchase";
import type { SumReceivedGroupByProduct, WarehouseWithLocationData } from "../../products/types/product";
import type { DeliverStockItem, InventoryHistoryByPurchaseOrder, ReceiveStockItem, StockDataBySku } from "../../stocks/types/stock";
import { useNavigate, useParams } from "react-router-dom";
import CheckIcon from '@mui/icons-material/Check';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useEffect, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { jaJP } from "@mui/x-data-grid/locales";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { purchaseAPI } from "../api/purchaseAPI";
import { stockAPI } from "../../stocks/api/stockAPI";
import { StyledDataGrid } from "../../../shared/components/global/StyledDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import useRoleFlags from "../../auth/hooks/useRoleFlags";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * 受領確認ダイアログコンポーネント
 *
 * 指定した注文（PO）に対する受領数量を確認するダイアログを表示する
 *
 * @param open - ダイアログの表示・非表示
 * @param onClose - キャンセルボタンや背景クリックで閉じる際のコールバック
 * @param onConfirm - 確認ボタン押下時のコールバック
 * @param supplier - 仕入先名
 * @param poId - 注文番号（Purchase Order ID）
 * @param warehouse - 倉庫名
 * @param quantity - 受領数量
 * @param isPending - 確認処理中かどうか。true の場合ボタンは無効化され「確認中…」と表示
 */

// 購入確認ダイアログ
interface ReceiveConfirmDialogProps {
    open: boolean;
    onClose: () => void;    // ダイアログの開閉
    onConfirm: () => void;  // 背景クリックで閉じる
    supplier: string;
    warehouse: string;
    quantity: number;
    poId: string;
    isPending?: boolean;
}

export const ReceiveConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    supplier,
    poId,
    warehouse,
    quantity,
    isPending
}: ReceiveConfirmDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: 2, p: 2 } }
            }}
        >
            <DialogTitle>{supplier} | {poId}</DialogTitle>
            <DialogContent>
                <Typography>
                    倉庫 : {warehouse}
                </Typography>
                <Typography>
                    受領数量 : {quantity}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="warning" onClick={onClose}>
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onConfirm}
                    disabled={isPending}
                >
                    {isPending ? "確認中..." : "確認"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

/**
 * 受領・配送フォームダイアログコンポーネント
 *
 * 指定した商品の受領または配送数量を入力して確認するためのダイアログ。
 * フォームには商品名（読み取り専用）、倉庫選択、数量、メモを入力できる。
 * 入力後、確認ダイアログを表示して親コンポーネントに送信する。
 *
 * @param open - ダイアログの表示・非表示
 * @param onClose - キャンセルまたは閉じる操作時のコールバック
 * @param onReceive - 受領処理時のコールバック。フォームの入力値を受け取る
 * @param onDeliver - 配送処理時のコールバック。フォームの入力値を受け取る
 * @param product - 対象商品のデータ（productName, detailIdなど）
 * @param poId - 注文番号（Purchase Order ID）
 * @param supplier - 仕入先名
 * @param warehouses - 選択可能な倉庫の配列
 * @param isPending - 処理中フラグ。true の場合ボタンを無効化
 * @param remains - 残り数量。数量フィールドの最大値として使用
 * @param title - ダイアログタイトル。受領か配送かを示す
 */

// 受領フォームダイアログ
interface ReceiveFormDialogProps {
    open: boolean;
    onClose: () => void;
    onReceive?: (receiveItem: ReceiveStockItem[]) => void;
    onDeliver?: (deliverItem: DeliverStockItem[]) => void;
    product: {
        productName: string;
        detailId: string;
    };
    poId: string;
    supplier: string;
    stockBySku?: StockDataBySku[];
    warehouses?: WarehouseWithLocationData[];
    targetName?: string;
    isPending?: boolean;
    remains: number;
    title: string;
}

export const ReceiveFormDialog = ({
    open,
    onClose,
    onReceive,
    onDeliver,
    product,
    poId,
    supplier,
    stockBySku,
    warehouses,
    isPending,
    remains,
    title,
}: ReceiveFormDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);
    const submitButton = title === "出荷" ? "売出" : "購入";


    // バリデーションスキーマ
    const schema = yup.object({
        productName: yup.string().required("商品名は必須です"),
        warehouses: yup.string().required("倉庫は必須です"),

        quantity: yup
            .number()
            .positive("受領数量は正の数で入力してください")
            .integer("受領数量は整数で入力してください")
            .required("受領数量は必須です")
            .max(remains, `受領数量は残りの数量(${remains})を超えることはできません`),
        note: yup.string()
            .max(200, "メモの最大文字数は200文字です。")
            .required("メモは必須です")
    });
    const { control, handleSubmit, reset, formState: { errors }, getValues } = useForm({
        defaultValues: {
            productName: product.productName || "",
            warehouses: "",
            quantity: 1,
            note: "",
        },
        resolver: yupResolver(schema),
        mode: "onBlur"
    });

    // 送信処理
    const onSubmit = (data: {
        productName: string;
        warehouses: string;
        quantity: number;
        note: string;

    }) => {
        // 親コンポーネントに送信
        if (onReceive) {
            const receiveItem = [{
                detailId: product.detailId,
                warehouseId: data.warehouses,
                receivedQty: data.quantity,
                note: data.note,
            }];
            onReceive(receiveItem);
        }
        if (onDeliver) {
            const deliverItem = [{
                detailId: product.detailId,
                warehouseId: data.warehouses,
                deliveredQty: data.quantity,
                note: data.note,
            }];
            onDeliver(deliverItem);
        }
    };

    // ダイアログ閉じたときにフォームリセット
    useEffect(() => {
        if (!open) {
            reset({
                productName: product.productName || "",
                warehouses: "",
                quantity: 1,
                note: "",
            });
        }
    }, [open, reset, product.productName]);

    return (
        <>
            <Dialog
                open={open}
                onClose={(_e, reason) => {
                    if (reason === 'backdropClick') {
                        return;
                    }
                    onClose();
                }}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: 2, p: 2 } }
                }}
            >
                <DialogTitle fontSize={20} textAlign="center">{title}</DialogTitle>
                <DialogContent>
                    {/* 商品名フィールド（読み取り専用） */}
                    <Controller
                        name="productName"
                        control={control}
                        render={() => (
                            <TextField
                                label="商品名"
                                fullWidth
                                margin="normal"
                                defaultValue={product.productName}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        )}
                    />
                    {/* 倉庫選択フィールド */}
                    <Controller
                        name="warehouses"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="倉庫"
                                select
                                fullWidth
                                margin="normal"
                                {...field}
                                error={!!errors.warehouses}
                                helperText={errors.warehouses ? errors.warehouses.message : ' '}
                            >
                                {stockBySku?.map((stock) => (
                                    <MenuItem key={stock.warehouseId} value={stock.warehouseId}>
                                        {stockBySku
                                            ? `${stock.warehouseName}(${stock.reservedQuantity})`
                                            : stock.warehouseName}
                                    </MenuItem>
                                ))}
                                {warehouses?.map((wh) => (
                                    <MenuItem key={wh.id} value={wh.id}>
                                        {wh.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                    {/* 受領数量フィールド */}
                    <Controller
                        name="quantity"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label={`${title}数量`}
                                type="number"
                                fullWidth
                                margin="normal"
                                {...field}
                                error={!!errors.quantity}
                                helperText={errors.quantity ? errors.quantity.message : ' '}
                            />
                        )}
                    />
                    {/* メモフィールド */}
                    <Controller
                        name="note"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="メモ"
                                multiline
                                rows={4}
                                fullWidth
                                margin="normal"
                                {...field}
                                error={!!errors.note}
                                helperText={errors.note ? errors.note.message : ' '}
                            />
                        )}
                    />
                </DialogContent>
                {/* アクションボタン */}
                <DialogActions>
                    <Button variant="contained" color="warning" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmit(() => setOpenSubmitConfirm(true))}
                        disabled={isPending}
                    >
                        {isPending ? `${submitButton}中...` : submitButton}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* 確認ダイアログ */}
            <ReceiveConfirmDialog
                open={openSubmitConfirm}
                onClose={() => setOpenSubmitConfirm(false)}
                poId={poId}
                supplier={supplier}
                warehouse={getValues("warehouses")}
                quantity={getValues("quantity")}
                onConfirm={() => {
                    const values = getValues();
                    onSubmit(values);
                    setOpenSubmitConfirm(false);
                }}
                isPending={isPending}
            />
        </>

    )
}

// 受領フォームメインコンポーネント
const ReceiveForm = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { poId } = useParams<{ poId: string }>(); // URLパラメータから発注IDを取得

    const { isSM } = useScreen();
    const { isStaff } = useRoleFlags();
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState<{
        productName: string;
        detailId: string;
    } | null>(null);

    const [openReceiveForm, setOpenReceiveForm] = useState(false);
    const [selectedRemains, setSelectedRemains] = useState<number | null>(null);    // 残り数量

    // データ取得
    const { isLoading, error, data } = useQuery<{
        purchaseOrder: PurchaseOrderData;
        receivedQtyMap: Record<string, number>;
        resWarehouse: WarehouseWithLocationData[];
        resInventoryHistoryByPurchaseOrder: InventoryHistoryByPurchaseOrder[];
    }>({
        queryKey: ["purchase-order-detail", poId],
        queryFn: async () => {
            // 発注詳細
            const resPODetail = await purchaseAPI.getPurchaseOrderById(Number(poId));
            // 発注詳細
            const resSumReceivedQty = await purchaseAPI.getSumReceivedQtyByPoGroupByProduct(Number(poId));
            // 倉庫情報
            const resWarehouse = await stockAPI.getAllWarehouseWithLocation();
            // 在庫履歴
            const resInventoryHistoryByPurchaseOrder = await stockAPI.getInventoryHistoryByPurchaseOrder(Number(poId));
            // 受領済数量マップを作成
            const receivedQtyMap: Record<string, number> = {};

            resSumReceivedQty.data.forEach((item: SumReceivedGroupByProduct) => {

                receivedQtyMap[item.sku] = item.receivedQty;
            });
            return {
                purchaseOrder: resPODetail.data,
                receivedQtyMap,
                resWarehouse: resWarehouse.data,
                resInventoryHistoryByPurchaseOrder: resInventoryHistoryByPurchaseOrder.data,
            };
        },
        enabled: !!poId // poIdがある場合のみ実行
    });

    // 受領処理用Mutation
    const receiveMutation = useMutation({
        mutationFn: async (data: { receiveItem: ReceiveStockItem[], poId: number }) => {
            return stockAPI.receiveStock(data.receiveItem, data.poId);
        },
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.ORDER.RECEIVE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchase-order-detail"] });
            setTimeout(() => {
                navigate(`/purchase-order/${poId}`);
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.ORDER.RECEIVE_FAILED, "error");
        }
    });

    // DataGrid列定義
    const columns: GridColDef<(typeof rows)[number]>[] = [
        { field: 'detailId', headerName: 'ID', flex: 1 },

        {
            field: 'productName',
            headerName: '商品名',
            flex: 2,
            editable: true,
        },
        {
            field: 'warehouseName',
            headerName: '倉庫',
            flex: 1.5,
            editable: true,
        },
        {
            field: 'changeQty',
            headerName: '受領数量',
            sortable: false,
            flex: 1.5,
        },
        {
            field: 'notes',
            headerName: '説明',
            flex: 2,
            editable: true,
        },
    ];

    // DataGrid行データ作成
    const rows = data?.resInventoryHistoryByPurchaseOrder?.map((row, index) => ({
        id: index,
        detailId: row.id,
        productName: row.productName,
        warehouseName: row.warehouseName,
        changeQty: row.changeQty,
        notes: row.notes,
    })) ?? [];


    return (
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header
                        title={`注文番号: ${data?.purchaseOrder?.id ?? ""} | 仕入先: ${data?.purchaseOrder?.supplierName ?? ""}`}
                        subtitle={`ステータス: ${data?.purchaseOrder?.status ?? ""}`}
                    />
                )}
                <Box mt={4}>
                    <Tooltip title="元に戻す">
                        <IconButton aria-label="元に戻す" color='info' onClick={() => {
                            navigate(`/purchase-order/${poId}`)
                        }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box mt={3} height="75vh">
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {/* 発注詳細テーブル */}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table sx={{ backgroundColor: colors.primary[400], tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: colors.blueAccent[500],
                                        color: colors.grey[100]
                                    }}
                                >
                                    <TableCell></TableCell>
                                    <TableCell>商品名</TableCell>
                                    <TableCell>発注</TableCell>
                                    <TableCell>受領数</TableCell>
                                    <TableCell>残数</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.purchaseOrder?.details.map((detail, index) => {
                                    const received = data.receivedQtyMap[detail.sku || ""] || 0;
                                    const remains = detail.qty - received;
                                    return (
                                        < TableRow key={index} >
                                            <TableCell>
                                                {remains === 0 ? (
                                                    <Tooltip title="商品はすでに受領済み">
                                                        <IconButton size="small" aria-label="受領済み">
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title={isStaff ? "管理者または倉庫管理者のみ受領可能" : "受領"}>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                aria-label="受領"
                                                                disabled={isStaff}
                                                                onClick={() => {
                                                                    setSelectedProduct({
                                                                        productName: detail.productName,
                                                                        detailId: detail.id
                                                                    });
                                                                    setOpenReceiveForm(true);
                                                                    setSelectedRemains(remains);
                                                                }}
                                                            >
                                                                <WarehouseIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell>{detail.productName}</TableCell>
                                            <TableCell>{detail.qty}</TableCell>
                                            <TableCell>{received}</TableCell>
                                            <TableCell>{remains}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {/* 在庫履歴タイトル */}
                <Typography
                    sx={{
                        mb: 3,
                        mt: 5,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 600,
                        color: colors.grey[200]
                    }}>
                    在庫履歴
                </Typography>
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (

                    <StyledDataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }}
                        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                        pageSizeOptions={[5]}
                        disableRowSelectionOnClick
                        autoHeight
                        mode={theme.palette.mode}
                    />
                )}
                {/* 受領フォームダイアログ */}
                {selectedProduct && (
                    <ReceiveFormDialog
                        open={openReceiveForm}
                        onClose={() => setOpenReceiveForm(false)}
                        onReceive={(receiveItem) => {
                            if (poId) {
                                receiveMutation.mutate({ receiveItem, poId: Number(poId) });
                            }
                        }}
                        isPending={receiveMutation.isPending}
                        warehouses={data?.resWarehouse || []}
                        product={selectedProduct}
                        remains={selectedRemains || 0}
                        poId={poId || ""}
                        supplier={data?.purchaseOrder.supplierName || ""}
                        title="受領"
                    />
                )}
            </Box>
        </Box >
    )
}

export default ReceiveForm;