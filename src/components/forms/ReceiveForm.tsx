import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../layout/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PurchaseOrderData, ReceiveStockItem, SumReceivedGroupByProduct, WarehouseWithLocationData } from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../../services/ApiService";
import CustomSnackbar from "../customSnackbar/CustomSnackbar";
import { useSnackbar } from "../../hooks/useSnackbar";
import CheckIcon from '@mui/icons-material/Check';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useEffect, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

interface PurchaseConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    supplier: string;
    warehouse: string;
    quantity: number;
    poId: string;
    isPending?: boolean;
}

export const PurchaseConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    supplier,
    poId,
    warehouse,
    quantity,
    isPending
}: PurchaseConfirmDialogProps) => {
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

interface ReceiveFormDialogProps {
    open: boolean;
    onClose: () => void;
    onReceive: (receiveItem: ReceiveStockItem[]) => void;
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
}

export const ReceiveFormDialog = ({
    open,
    onClose,
    onReceive,
    product,
    poId,
    supplier,
    warehouses,
    isPending,
    remains,
}: ReceiveFormDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);

    const schema = yup.object({
        productName: yup.string().required("商品名は必須です"),
        warehouses: yup.string().required("倉庫は必須です"),

        receiveQty: yup
            .number()
            .positive("受領数量は正の数で入力してください")
            .integer("受領数量は整数で入力してください")
            .required("受領数量は必須です")
            .max(remains, `受領数量は残りの数量(${remains})を超えることはできません`),
        note: yup.string()
            .matches(/^[a-zA-Z0-9\s]*$/, "文字と数字のみ入力できます。")
            .max(200, "メモの最大文字数は200文字です。"),
    });
    const { control, handleSubmit, reset, formState: { errors },getValues } = useForm({
        defaultValues: {
            productName: product.productName || "",
            warehouses: "",
            receiveQty: 1,
            note: "",
        },
        resolver: yupResolver(schema),
        mode: "onBlur"
    });

    const onSubmit = (data: any) => {
        const receiveItem = [{
            detailId: product.detailId,
            warehouseId: data.warehouses,
            receivedQty: data.receiveQty,
            note: data.note,
        }];

        onReceive(receiveItem);
    };
    useEffect(() => {
        if (!open) {
            reset({
                productName: product.productName || "",
                warehouses: "",
                receiveQty: 1,
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
                <DialogTitle>受領</DialogTitle>
                <DialogContent
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
                                helperText={errors.warehouses?.message}
                            >
                                {warehouses?.map((wh) => (
                                    <MenuItem key={wh.id} value={wh.id}>
                                        {wh.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    <Controller
                        name="receiveQty"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="受領数量"
                                type="number"
                                fullWidth
                                margin="normal"
                                {...field}
                                error={!!errors.receiveQty}
                                helperText={errors.receiveQty?.message}
                            />
                        )}
                    />
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
                                helperText={errors.note?.message}
                            />
                        )}
                    />
                </DialogContent>
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
            <PurchaseConfirmDialog
                open={openSubmitConfirm}
                onClose={() => setOpenSubmitConfirm(false)}
                poId={poId}
                supplier={supplier}
                warehouse={getValues("warehouses")}
                quantity={getValues("receiveQty")}
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

const ReceiveForm = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { poId } = useParams<{ poId: string }>();

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState<{
        productName: string;
        detailId: string;
    } | null>(null);

    const [openReceiveForm, setOpenReceiveForm] = useState(false);
    const [selectedRemains, setSelectedRemains] = useState<number | null>(null);

    const { isLoading, error, data } = useQuery<{
        purchaseOrder: PurchaseOrderData;
        receivedQtyMap: Record<number, number>;
        resWarehouse: WarehouseWithLocationData[];
    }>({
        queryKey: ['purchaseOrderDetail', poId],
        queryFn: async () => {
            const resPODetail = await ApiService.getPurchaseOrderById(Number(poId));
            const resSumReceivedQty = await ApiService.getSumReceivedQtyByPoGroupByProduct(Number(poId));
            const resWarehouse = await ApiService.getAllWarehouseWithLocation();
            const receivedQtyMap: Record<number, number> = {};

            resSumReceivedQty.data.forEach((item: SumReceivedGroupByProduct) => {

                receivedQtyMap[Number(item.productId)] = item.receivedQty;
            });
            console.log(resPODetail.data);
            return {
                purchaseOrder: resPODetail.data,
                receivedQtyMap,
                resWarehouse: resWarehouse.data,
            };
        },
        enabled: !!poId
    });

    const receiveMutation = useMutation({
        mutationFn: async (data: { receiveItem: ReceiveStockItem[], poId: number }) => {
            return ApiService.receiveStock(data.receiveItem, data.poId);
        },
        onSuccess: () => {
            showSnackbar("商品を注文しました。", "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail"] });
            setTimeout(() => {
                navigate(`/purchase-order/${poId}`);
            }, 500);
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "注文に失敗しました", "error");
        }
    });

    return (
        <Box
            m={2}
            p={1}
            sx={{
                borderRadius: 1
            }}
        >
            <Header
                title={`注文番号: ${data?.purchaseOrder?.id ?? ""} | 仕入先: ${data?.purchaseOrder?.supplierName ?? ""}`}
                subtitle={`ステータス: ${data?.purchaseOrder?.status ?? ""}`}
            />
            <Box mt={3} height="75vh">
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
                                                    <IconButton size="small">
                                                        <CheckIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <IconButton
                                                    size="small"
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
                {selectedProduct && (
                    <ReceiveFormDialog
                        open={openReceiveForm}
                        onClose={() => setOpenReceiveForm(false)}
                        onReceive={(receiveItem) => {
                            if (poId) {
                                receiveMutation.mutate({ receiveItem, poId: Number(poId) });
                            } else {
                                console.error("");
                            }
                        }}
                        isPending={receiveMutation.isPending}
                        warehouses={data?.resWarehouse || []}
                        product={selectedProduct}
                        remains={selectedRemains || 0}
                        poId={poId || ""}
                        supplier={data?.purchaseOrder.supplierName || ""}
                    />
                )}
            </Box>
        </Box >
    )
}

export default ReceiveForm;