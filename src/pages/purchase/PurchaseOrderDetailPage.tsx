import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme } from "@mui/material";
import Header from "../../layout/Header";
import ApiService from "../../services/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import type { PurchaseOrderData, PurchaseOrderDetailData, PurchaseOrderProcessingDetailData, ReceiveData } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tokens } from "../../theme";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import * as yup from "yup";
import { useSnackbar } from "../../hooks/useSnackbar";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import type { WarehouseWitdhLocationData } from "../../types/warehouse";
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';

const validationSchema = Yup.object({
    productId: Yup.number().required('商品は必須です'),
    warehouseId: Yup.number().required('倉庫は必須です'),
    receivedQty: Yup.number()
        .required('受領数量は必須です')
        .min(1, '受領数量は1以上でなければなりません'),
    note: Yup.string()
        .optional()
        .max(500, '備考は500文字以下でなければなりません')
});

const descriptionSchema = yup.object({
    description: yup
        .string()
        .required("説明を入力してください")
        .max(500, "説明は500文字以内で入力してください"),
});

interface Product {
    detailId: number,
    id: number;
    name: string;
}

interface Warehouse {
    id: number;
    name: string;
}

interface ReceiveDialogProps {
    open: boolean;
    onClose: () => void;
    // onSubmit: (data: {
    //     detailId: number;
    //     warehouseId: number;
    //     receivedQty: number;
    //     note: string;
    // }) => void;
    onSubmit: (data: ReceiveData) => void;
    products: Product[];
    warehouses: Warehouse[];
}

const ReceiveDialog = ({
    open,
    onClose,
    onSubmit,
    products,
    warehouses,
}: ReceiveDialogProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.blueAccent[900],
                        borderRadius: 2,
                    }
                }
            }}
        >
            <Formik
                initialValues={{
                    productId: '',
                    warehouseId: '',
                    receivedQty: '',
                    note: ''
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    const receiveData: ReceiveData = {
                        detailId: Number(values.productId),
                        warehouseId: Number(values.warehouseId),
                        receivedQty: Number(values.receivedQty),
                        note: values.note,
                    };
                    onSubmit(receiveData)
                    onClose();
                }}
            >
                {({ setFieldValue, values, errors, touched, isSubmitting }) => (
                    <Form>
                        <DialogTitle>在庫受領</DialogTitle>
                        <DialogContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                pt: "20px !important",
                                gap: 2,
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
                            {/* Product */}
                            <Field
                                name="productId"
                                as={TextField}
                                select
                                label="商品"
                                value={values.productId}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const selectedProductId = e.target.value;
                                    setFieldValue("productId", selectedProductId);
                                    const selectedProduct = products.find(product => product.id === Number(selectedProductId));
                                    if (selectedProduct) {
                                        setFieldValue("detailId", selectedProduct.detailId);
                                    }

                                }}
                                fullWidth
                                error={touched.productId && !!errors.productId}
                                helperText={touched.productId && errors.productId}
                            >
                                {products.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.name}
                                    </MenuItem>
                                ))}
                            </Field>

                            {/* Warehouse */}
                            <Field
                                name="warehouseId"
                                as={TextField}
                                select
                                label="倉庫"
                                value={values.warehouseId}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("warehouseId", e.target.value)}
                                fullWidth
                                error={touched.warehouseId && !!errors.warehouseId}
                                helperText={touched.warehouseId && errors.warehouseId}
                            >
                                {warehouses.map((w) => (
                                    <MenuItem key={w.id} value={w.id}>
                                        {w.name}
                                    </MenuItem>
                                ))}
                            </Field>

                            {/* Received Quantity */}
                            <Field
                                name="receivedQty"
                                as={TextField}
                                label="受領数量"
                                type="number"
                                value={values.receivedQty}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("receivedQty", e.target.value)}
                                inputProps={{ min: 0 }}
                                fullWidth
                                error={touched.receivedQty && !!errors.receivedQty}
                                helperText={touched.receivedQty && errors.receivedQty}
                            />

                            {/* Note */}
                            <Field
                                name="note"
                                as={TextField}
                                label="備考"
                                value={values.note}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("note", e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" color="warning" onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button type="submit" variant="contained" color="success" disabled={isSubmitting}>
                                送信
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};
const PurchaseOrderDetailPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { poId } = useParams<{ poId: string }>();

    const [details, setDetails] = useState<PurchaseOrderDetailData[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [openReceiveDialog, setOpenReceiveDialog] = useState(false);

    const handleReceiveClick = () => {
        setOpenReceiveDialog(true);
    };

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const baseQuery = useQuery<PurchaseOrderData>({
        queryKey: ['purchaseOrderDetail', poId],
        queryFn: async () => {
            const resPODetail = await ApiService.getPurchaseOrderDetail(Number(poId));
            return resPODetail.data;
        },
        enabled: !!poId
    });

    const processingQuery = useQuery<PurchaseOrderProcessingDetailData[]>({
        queryKey: ["purchaseOrderProcessing", poId],
        queryFn: () =>
            ApiService.getPurchaseOrderDetailProcessing(Number(poId)).then(res => res.data),
        enabled: baseQuery.data?.status === "PROCESSING",
    });
    const warehouseQuery = useQuery<WarehouseWitdhLocationData[]>({
        queryKey: ["warehouses", poId],
        queryFn: () =>
            ApiService.getAllWarehouseWithLocation().then(res => res.data),
        enabled: baseQuery.data?.status === "PROCESSING",
    });

    const receiveMutation = useMutation({
        mutationFn: async (receiveData: ReceiveData) => {
            const receiveRes = await ApiService.receiveStock(Number (poId), receiveData);
            return receiveRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || "商品を編集しました", "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "販売に失敗しました。", "error");
        },

    });
    const isLoading = baseQuery.isLoading || processingQuery.isLoading || warehouseQuery.isLoading;
    const error = baseQuery.error || processingQuery.error || warehouseQuery.error;
    const data = {
        base: baseQuery.data,
        processing: processingQuery.data,
        warehouse: warehouseQuery.data
    };

    useEffect(() => {
        if (data.base?.status === "NEW" && data.base.details) {
            setDetails(data.base.details);
        }
        if (data.base?.status === "NEW" && data.base.description) {
            setDescription(data.base.description);
        }
    }, [data.base]);


    const updateMutation = useMutation({
        mutationFn: async (updatedData: PurchaseOrderData) => ApiService.updatePurchaseOrderQuantityAndDescription(Number(poId), updatedData),
        onSuccess: () => {
            setIsEditing(false);
            setDescriptionError(null);
            showSnackbar("orderを編集しました。", "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail", poId] });

        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "編集に失敗しました", "error");
        }
    });

    const totalAmount = useMemo(() => {
        return details.reduce((sum, item) => sum + item.qty * item.cost, 0);
    }, [details]);

    const handleSave = async () => {
        try {
            await descriptionSchema.validate({ description }, { abortEarly: false });
            const updatedData: PurchaseOrderData = {
                ...baseQuery.data!,
                details: details,
                description: description,
            };
            updateMutation.mutate(updatedData);
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                setDescriptionError(err.message);
            }
        }
    };
    return (
        <Box m={3}>
            <Header
                title={`注文番号: ${data.base?.supplierId ?? ""} | 仕入先: ${data.base?.supplierName ?? ""}`}
                subtitle={`ステータス: ${data.base?.status ?? ""} | 作成日: ${data.base?.createdAt ?? ""}`}
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
                        {data.base?.status === "PROCESSING" ? (
                            <TableHead>
                                <TableRow
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: colors.blueAccent[500],
                                        color: colors.grey[100]
                                    }}
                                >
                                    <TableCell>商品名</TableCell>
                                    <TableCell>SKUコード</TableCell>
                                    <TableCell>注文済</TableCell>
                                    <TableCell>受領済</TableCell>
                                    <TableCell>残数</TableCell>
                                </TableRow>
                            </TableHead>
                        ) : (
                            <TableHead>
                                <TableRow
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: colors.blueAccent[500],
                                        color: colors.grey[100]
                                    }}
                                >
                                    <TableCell>商品名</TableCell>
                                    <TableCell>SKUコード</TableCell>
                                    <TableCell>数量</TableCell>
                                    <TableCell>単価（円）</TableCell>
                                    <TableCell>小計（円）</TableCell>
                                </TableRow>
                            </TableHead>

                        )}
                        {data.base?.status === "PROCESSING" ? (
                            <TableBody>
                                {(data.processing! && data.processing?.length > 0) ? (
                                    data.processing?.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.productName}</TableCell>
                                            <TableCell>{row.sku}</TableCell>
                                            <TableCell>{row.orderedQty}</TableCell>
                                            <TableCell>{row.receivedQty}</TableCell>
                                            <TableCell>{row.remainingQty}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            該当する商品がありません
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        ) : (

                            <TableBody>
                                {(details.length > 0) ? (
                                    details.map((detail, index) => {
                                        const subtotal = detail.qty * detail.cost;

                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{detail.productName}</TableCell>
                                                <TableCell>{detail.sku}</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            value={detail.qty}
                                                            onChange={(e) => {
                                                                const newQty = Number(e.target.value);
                                                                const newDetails = [...details];
                                                                newDetails[index].qty = newQty;
                                                                setDetails(newDetails);
                                                            }}

                                                            size="small"
                                                            autoFocus={index === 0}
                                                            slotProps={{
                                                                input: {
                                                                    inputProps: { min: 0 },
                                                                },
                                                            }}
                                                        />
                                                    ) : (
                                                        detail.qty
                                                    )}
                                                </TableCell>
                                                <TableCell>{detail.cost}</TableCell>
                                                <TableCell>{subtotal}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            該当する商品がありません
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                                    合計金額:
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {totalAmount} 円
                                </TableCell>
                            </TableBody>
                        )}
                    </Table>
                </TableContainer>


                <Box mt={2} mb={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} mb={2}>
                        注文説明:
                    </Typography>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={!!descriptionError}
                            helperText={descriptionError}
                            sx={{
                                backgroundColor: colors.primary[800],
                            }}
                        />
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {data.base?.description ?? "説明なし"}
                        </Typography>
                    )}
                </Box>

                <ReceiveDialog
                    open={openReceiveDialog}
                    onClose={() => setOpenReceiveDialog(false)}
                    onSubmit={receiveMutation.mutate}
                    products={baseQuery.data?.details.map(d => ({
                        detailId: Number(d.id),
                        id: d.productId,
                        name: d.productName
                    })) || []}
                    warehouses={data.warehouse?.map(w => ({
                        id: Number(w.id),
                        name: w.name
                    })) || []}
                />
            </Box>
            {data.base?.status === "PROCESSING" && (
                <Button variant="contained" color="success" onClick={handleReceiveClick}>
                    Receive
                </Button>
            )}

            {data.base?.status === "NEW" && (
                <>
                    {isEditing ? (
                        <Button variant="contained" color="success" onClick={handleSave}>
                            保存
                        </Button>
                    ) : (
                        <Button variant="contained" color="secondary" onClick={() => setIsEditing(!isEditing)}>
                            編集
                        </Button>
                    )}

                    <Button variant="contained" color="error" >
                        削除
                    </Button>

                    <Button variant="contained" color="info" >
                        注文を確定する
                    </Button>
                </>
            )}

            {data.base?.status === "COMPLETE" && (
                <Button variant="contained" color="success" onClick={() => alert("OK")}>
                    OK
                </Button>
            )}

        </Box >
    )
}

export default PurchaseOrderDetailPage;