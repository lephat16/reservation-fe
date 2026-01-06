import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme } from "@mui/material";
import Header from "../../layout/Header";
import ApiService from "../../services/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import type { PurchaseOrderData, PurchaseOrderDetailData, SumReceivedGroupByProduct } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tokens } from "../../theme";
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useSnackbar } from "../../hooks/useSnackbar";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import { DeleteConfirmDialog } from "../product/ProductPage";

const descriptionSchema = yup.object({
    description: yup
        .string()
        .required("説明を入力してください")
        .max(500, "説明は500文字以内で入力してください"),
});


interface SubmitConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetName?: string;
    title?: string;
    isPending?: boolean;
}

export const SubmitConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    targetName,
    isPending
}: SubmitConfirmDialogProps) => {
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
            <DialogTitle>{title || "確認"}</DialogTitle>
            <DialogContent>
                <Typography>
                    {targetName
                        ? `"${targetName}" を注文してもよろしいですか？`
                        : "この商品を注文してもよろしいですか？"}
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
                    {isPending ? "注文中..." : "注文"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const PurchaseOrderDetailPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { poId } = useParams<{ poId: string }>();

    const [details, setDetails] = useState<PurchaseOrderDetailData[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);
    const [openReceiveConfirm, setOpenReceiveConfirm] = useState(false);

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();



    const { isLoading, error, data } = useQuery<PurchaseOrderData>({
        queryKey: ['purchaseOrderDetail', poId],
        queryFn: async () => {
            const resPODetail = await ApiService.getPurchaseOrderById(Number(poId));
            console.log(resPODetail);
            console.log(resPODetail.data);
            return resPODetail.data;
        },
        enabled: !!poId
    });
    console.log(data?.status);
    const { isLoading: isLoadingReceivedQty, error: errorReceivedQty, data: dataReceivedQty } = useQuery<SumReceivedGroupByProduct[] | undefined>({
        queryKey: ['getSumReceivedQtyByPoGroupByProduct', poId],
        queryFn: async () => {
            if (data?.status === 'PROCESSING') {
                const resSumReceivedQty = await ApiService.getSumReceivedQtyByPoGroupByProduct(Number(poId));
                console.log(resSumReceivedQty);
                return resSumReceivedQty.data;
            }

            return undefined;
        },
        enabled: !!poId && data?.status === 'PROCESSING'
    });



    useEffect(() => {
        if (data?.details) {
            setDetails(data.details);
        }
        if (data?.description) {
            setDescription(data.description);
        }
    }, [data?.details, data?.description]);

    const totalAmount = useMemo(() => {
        return details.reduce((sum, item) => sum + item.qty * item.cost, 0);
    }, [details]);

    const handleSave = async () => {
        try {
            await descriptionSchema.validate({ description }, { abortEarly: false });
            const updatedData: PurchaseOrderData = {
                ...data!,
                details: details,
                description: description,
            };
            await ApiService.updatePurchaseOrderQuantityAndDescription(Number(poId), updatedData);
            setIsEditing(false);
            setDescriptionError(null);
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                setDescriptionError(err.message);
            }
        }
    };

    const deleteMutation = useMutation({
        mutationFn: async () => ApiService.deletePurchaseOrder(Number(poId)),
        onSuccess: () => {
            showSnackbar("商品を削除しました", "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail"] });
            setTimeout(() => {
                navigate("/purchase-order");
            }, 500);
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "削除に失敗しました", "error");
        }
    });
    const submitMutation = useMutation({
        mutationFn: async () => ApiService.placePurchaseOrder(Number(poId)),
        onSuccess: () => {
            showSnackbar("商品を注文しました。", "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail"] });
            setTimeout(() => {
                navigate("/purchase-order");
            }, 500);
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "注文に失敗しました", "error");
        }
    });
    

    const mappedQty = details?.map(item => {
        const sumReceived = dataReceivedQty?.find(d => d.sku === item.sku);

        if (sumReceived) {
            return {
                ...item,
                received: sumReceived.receivedQty
            };
        }

        return item;
    });

    console.log(mappedQty);
    return (
        <Box m={3}>
            <Header
                title={`注文番号: ${data?.id ?? ""} | 仕入先: ${data?.supplierName ?? ""}`}
                subtitle={`ステータス: ${data?.status ?? ""} | 作成日: ${data?.createdAt ?? ""}`}
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
                {(isLoading || isLoadingReceivedQty) && (
                    <Box textAlign="center" my={4}>
                        <CircularProgress />
                        <Typography>データを読み込み中...</Typography>
                    </Box>
                )}
                {/* エラー表示 */}
                {(error || errorReceivedQty) && (
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
                                <TableCell>商品名</TableCell>
                                <TableCell>SKUコード</TableCell>
                                <TableCell>数量</TableCell>
                                <TableCell>単価（円）</TableCell>
                                <TableCell>小計（円）</TableCell>
                                <TableCell>ステータス</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(mappedQty.length > 0) ? (
                                mappedQty.map((detail, index) => {
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
                                                ) : (data?.status === "NEW" ? detail.qty : `${detail.received || 0}/${detail.qty}`)

                                                }
                                            </TableCell>
                                            <TableCell>{detail.cost}</TableCell>
                                            <TableCell>{subtotal}</TableCell>
                                            <TableCell>{detail.status}</TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        該当する商品がありません
                                    </TableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                                    合計金額:
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {totalAmount} 円
                                </TableCell>
                            </TableRow>
                        </TableBody>
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
                            {data?.description ?? "説明なし"}
                        </Typography>
                    )}
                </Box>

            </Box>
            {isEditing ? (
                <Button variant="contained" color="success" onClick={() => handleSave()}>
                    保存
                </Button>
            ) : (
                <Button variant="contained" color="secondary" onClick={() => setIsEditing(!isEditing)}>
                    編集
                </Button>

            )}
            <Button variant="contained" color="error" onClick={() => setOpenDeleteConfirm(true)}>
                削除
            </Button>

            {data?.status === 'NEW' && (
                <Button variant="contained" color="info" onClick={() => setOpenSubmitConfirm(true)}>
                    注文
                </Button>
            )}
            {(data?.status === 'PENDING' || data?.status === 'PROCESSING') && (
                <Button variant="contained" color="info" onClick={() => navigate(`/purchase-order/${poId}/receive`)}>
                    受領
                </Button>
            )}

            <DeleteConfirmDialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                targetName={poId}
                onDelete={() => deleteMutation.mutate()}
                isDeleting={deleteMutation.isPending}
            />
            <SubmitConfirmDialog
                open={openSubmitConfirm}
                onClose={() => setOpenSubmitConfirm(false)}
                targetName={poId}
                onConfirm={() => submitMutation.mutate()}
                isPending={submitMutation.isPending}
            />
            {/* <SubmitConfirmDialog
                open={openReceiveConfirm}
                onClose={() => setOpenReceiveConfirm(false)}
                targetName={poId}
                onConfirm={() => receiveMutation.mutate()}
                isPending={receiveMutation.isPending}
            /> */}
        </Box >
    )
}

export default PurchaseOrderDetailPage;


