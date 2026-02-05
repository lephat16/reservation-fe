import { Box, Button, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import { useNavigate, useParams } from "react-router-dom";
import type { SaleOrderData, SaleOrderDetailData } from "../types/sell";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import Header from "../../../pages/Header";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import * as yup from "yup";
import { DeleteConfirmDialog } from "../../../shared/components/DeleteConfirmDialog";
import { SubmitConfirmDialog } from "../../purchases/components/PurchaseOrderDetailPage";
import type { AxiosError } from "axios";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { saleAPI } from "../api/saleAPI";
import { useSaleOrderDetail } from "../hooks/useSaleOrderDetail";
import { useScreen } from "../../../shared/components/global/ScreenContext";

const descriptionSchema = yup.object({
    description: yup
        .string()
        .required("説明を入力してください")
        .max(500, "説明は500文字以内で入力してください"),
});

const SellOrderDetailPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { soId } = useParams<{ soId: string }>();

    const { isSM } = useScreen();
    const [details, setDetails] = useState<SaleOrderDetailData[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();

    const { isLoading, error, data } = useSaleOrderDetail(Number(soId));

    useEffect(() => {
        if (data?.details) {
            setDetails(data.details);
        }
        if (data?.description) {
            setDescription(data.description);
        }
    }, [data?.details, data?.description]);

    const totalAmount = useMemo(() => {
        return details.reduce((sum, item) => sum + item.qty * item.price, 0);
    }, [details]);

    const handleSave = async () => {
        try {
            await descriptionSchema.validate({ description }, { abortEarly: false });
            const updatedData: SaleOrderData = {
                ...data!,
                details: details,
                description: description,
            };
            await saleAPI.updateSalesOrderQuantityAndDescription(Number(soId), updatedData);
            showSnackbar(SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success");
            setIsEditing(false);
            setDescriptionError(null);
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                setDescriptionError(err.message);
            }
            showSnackbar(SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        }
    };

    const deleteMutation = useMutation({
        mutationFn: async () => saleAPI.deleteSellOrder(Number(soId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["sellOrderDetail"] });
            setTimeout(() => {
                navigate("/sell-order");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });
    const submitMutation = useMutation({
        mutationFn: async () => saleAPI.prepareSaleOrder(Number(soId)),
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.SELL.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["sellOrderDetail"] });
            setTimeout(() => {
                navigate("/sell-order");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.SELL.CREATE_FAILED, "error");
        }
    });
    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title={`注文番号: ${data?.id ?? ""}`}
                    subtitle={`ステータス: ${data?.status ?? ""} | 作成日: ${data?.createdAt ?? ""}`}
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
                                    <TableCell>商品名</TableCell>
                                    <TableCell>SKUコード</TableCell>
                                    <TableCell>数量</TableCell>
                                    <TableCell>単価（円）</TableCell>
                                    <TableCell>小計（円）</TableCell>
                                    <TableCell>ステータス</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {(data?.details ?? [].length > 0) ? (
                                    details.map((detail, index) => (
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
                                                ) : (data?.status === "NEW" ? detail.qty : `${detail.deliveredQty || 0}/${detail.qty}`)}

                                            </TableCell>
                                            <TableCell>{detail.price}</TableCell>
                                            <TableCell>{detail.qty * detail.price}</TableCell>
                                            <TableCell>{detail.status}</TableCell>
                                        </TableRow>
                                    ))
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
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={200} />
                ) : (
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
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                }}
                                error={!!descriptionError}
                                helperText={descriptionError}
                                sx={{
                                    backgroundColor: colors.primary[800],
                                }}
                            />
                        ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {description || "説明なし"}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
            <Stack
                direction="row"
                spacing={2}
            >

                {data?.status === 'NEW' && (isEditing ? (
                    <Button variant="contained" color="success" onClick={() => handleSave()}>
                        保存
                    </Button>
                ) : (
                    <Button variant="contained" color="secondary" onClick={() => setIsEditing(!isEditing)}>
                        編集
                    </Button>

                ))}

                <Button variant="contained" color="error" onClick={() => setOpenDeleteConfirm(true)}>
                    削除
                </Button>

                {data?.status === 'NEW' && (
                    <Button variant="contained" color="info" onClick={() => setOpenSubmitConfirm(true)}>
                        受注
                    </Button>
                )}
                {(data?.status === 'PENDING' || data?.status === 'PROCESSING') && (
                    <Button variant="contained" color="info" onClick={() => navigate(`/sell-order/${soId}/deliver`)}>
                        出荷
                    </Button>
                )}
            </Stack>

            <DeleteConfirmDialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                targetName={soId}
                onDelete={() => deleteMutation.mutate()}
                isDeleting={deleteMutation.isPending}
            />
            <SubmitConfirmDialog
                open={openSubmitConfirm}
                onClose={() => setOpenSubmitConfirm(false)}
                targetName={soId}
                onConfirm={() => submitMutation.mutate()}
                isPending={submitMutation.isPending}
                type="受注"
            />
        </Box>
    )
}

export default SellOrderDetailPage