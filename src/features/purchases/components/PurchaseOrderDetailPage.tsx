import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import Header from "../../../pages/Header";
import { useNavigate, useParams } from "react-router-dom";
import type { PurchaseOrderData, PurchaseOrderDetailData } from "../types/purchase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokens } from "../../../shared/theme";
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import type { AxiosError } from "axios";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { DeleteConfirmDialog } from "../../../shared/components/DeleteConfirmDialog";
import { purchaseAPI } from "../api/purchaseAPI";
import { usePurchaseOrderDetail } from "../hooks/usePurchaseOrderDetail";
import { useSumReceivedQtyByPoGroupByProduct } from "../../products/hooks/useSumReceivedQtyByPoGroupByProduct";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import type { RootState } from "../../auth/store";
import { useSelector } from "react-redux";

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
    type: string;
    isPending?: boolean;
}

export const SubmitConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    type,
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
            <DialogTitle>確認</DialogTitle>
            <DialogContent>
                <Typography>
                    {targetName
                        ? `${targetName}の${type}書を${type}してもよろしいですか？`
                        : "この商品を注文・受注してもよろしいですか？"}
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

    const role = useSelector((state: RootState) => state.auth.role);
    const isAdmin = role === "ADMIN";
    const isStaff = role === "STAFF";
    const isWarehouse = role === "WAREHOUSE";

    const [details, setDetails] = useState<PurchaseOrderDetailData[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);

    const { isSM } = useScreen();
    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();

    const { isLoading, error, data } = usePurchaseOrderDetail(Number(poId));
    const { isLoading: isLoadingReceivedQty, error: errorReceivedQty, data: dataReceivedQty } =
        useSumReceivedQtyByPoGroupByProduct(Number(poId), data);

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
            await purchaseAPI.updatePurchaseOrderQuantityAndDescription(Number(poId), updatedData);
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
        mutationFn: async () => purchaseAPI.deletePurchaseOrder(Number(poId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail"] });
            setTimeout(() => {
                navigate("/purchase-order");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });
    const submitMutation = useMutation({
        mutationFn: async () => purchaseAPI.placePurchaseOrder(Number(poId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.ORDER.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrderDetail"] });
            setTimeout(() => {
                navigate("/purchase-order");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.ORDER.CREATE_FAILED, "error");
        }
    });

    const mappedQty: PurchaseOrderDetailData[] = useMemo(() => {
        return details.map(item => {
            const sumReceived = dataReceivedQty?.find(d => d.sku === item.sku);
            return sumReceived
                ? { ...item, received: sumReceived.receivedQty }
                : item;
        });
    }, [details, dataReceivedQty]);

    return (
        <Box m={3}>
            {(isLoading || isLoadingReceivedQty) ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title={`注文番号: ${data?.id ?? ""} | 仕入先: ${data?.supplierName ?? ""}`}
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
                {(error || errorReceivedQty) && (
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
                )}
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
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
                                onChange={(e) => setDescription(e.target.value)}
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

                {(data?.status === 'NEW' && !isWarehouse) && (isEditing ? (
                    <Button variant="contained" color="success" onClick={() => handleSave()}>
                        保存
                    </Button>
                ) : (
                    <Button variant="contained" color="secondary" onClick={() => setIsEditing(!isEditing)}>
                        編集
                    </Button>

                ))}
                <Tooltip title={isWarehouse ? "管理者またはスタッフのみ削除可能" : ""} arrow>
                    <span>
                        <Button disabled={isWarehouse} variant="contained" color="error" onClick={() => setOpenDeleteConfirm(true)}>
                            削除
                        </Button>
                    </span>
                </Tooltip>
                {data?.status === 'NEW' && (
                    <Tooltip title={isWarehouse ? "管理者またはスタッフのみ注文可能" : ""} arrow>
                        <span>
                            <Button disabled={isWarehouse} variant="contained" color="info" onClick={() => setOpenSubmitConfirm(true)}>
                                注文
                            </Button>
                        </span>
                    </Tooltip>
                )}
                {(data?.status === 'PENDING' || data?.status === 'PROCESSING') && (
                    <Tooltip title={isStaff ? "管理者または倉庫管理者のみ受領可能" : ""} arrow>
                        <span>
                            <Button disabled={isStaff} variant="contained" color="info" onClick={() => navigate(`/purchase-order/${poId}/receive`)}>
                                受領
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </Stack>

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
                type="受注"
            />

        </Box >
    )
}

export default PurchaseOrderDetailPage;


