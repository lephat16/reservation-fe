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
import type { DeliverStockItem, InventoryHistoryByPurchaseOrder, ReceiveStockItem } from "../../stocks/types/stock";
import { useNavigate, useParams } from "react-router-dom";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
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
    warehouses: WarehouseWithLocationData[];
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
    warehouses,
    isPending,
    remains,
    title,
}: ReceiveFormDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);

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
                        {isPending ? "購入中..." : "購入"}
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
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
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
        receivedQtyMap: Record<number, number>;
        resWarehouse: WarehouseWithLocationData[];
        resInventoryHistoryByPurchaseOrder: InventoryHistoryByPurchaseOrder[];
    }>({
        queryKey: ["purchaseOrderDetail", poId],
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
            const receivedQtyMap: Record<number, number> = {};

            resSumReceivedQty.data.forEach((item: SumReceivedGroupByProduct) => {

                receivedQtyMap[Number(item.productId)] = item.receivedQty;
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
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail"] });
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
        <Box
            m={2}
            p={1}
            sx={{
                borderRadius: 1
            }}
        >
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title={`注文番号: ${data?.purchaseOrder?.id ?? ""} | 仕入先: ${data?.purchaseOrder?.supplierName ?? ""}`}
                    subtitle={`ステータス: ${data?.purchaseOrder?.status ?? ""}`}
                />
            )}
            <Box mt={3} height="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />

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
                                    const received = data.receivedQtyMap[detail.productId] || 0;
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