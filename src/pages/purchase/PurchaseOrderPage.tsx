import { Box, Button, Chip, CircularProgress, IconButton, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme, type SxProps, type Theme } from "@mui/material";
import Header from "../../layout/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApiService from "../../services/ApiService";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from "react";
import { useSnackbar } from "../../hooks/useSnackbar";
import { DeleteConfirmDialog } from "../product/ProductPage";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import type { AxiosError } from "axios";

const renderStatusChip = (status: string) => {
    const colorMap: Record<string, "secondary" | "primary" | "success" | "warning" | "error"> = {
        NEW: "secondary",
        PENDING: "warning",
        PROCESSING: "primary",
        COMPLETED: "success",
        CANCELLED: "error",
    };
    return <Chip label={status} color={colorMap[status] || "primary"} />;
};

const cellStyle = (align?: "right" | "center", truncate?: boolean): SxProps<Theme> => ({
    textAlign: align,
    whiteSpace: truncate ? "nowrap" : "normal",
    overflow: truncate ? "hidden" : "visible",
    textOverflow: truncate ? "ellipsis" : "clip",
});

const PurchaseOrderPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(0);



    const queryClient = useQueryClient();

    const { isLoading, error, data } = useQuery({
        queryKey: ["purchaseOrders"],
        queryFn: async () => {
            const resPO = await ApiService.getPurchaseOrders();
            const resSuppliers = await ApiService.getAllSuppliers();
            return {
                resPO: resPO.data,
                resSuppliers: resSuppliers.data
            }
        },
    });

    const resPO = data?.resPO ?? [];

    const columns = [
        { key: "id", label: "ID", width: isMobile ? "10%" : "5%" },
        { key: "supplierName", label: "仕入先", width: isMobile ? "35%" : "15%", truncate: true },
        { key: "status", label: "ステータス", width: isMobile ? "30%" : "10%", align: "center", truncate: true },
        { key: "userName", label: "ユーザー", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "total", label: isMobile ? "合計" : "合計金額", width: isMobile ? "30%" : "10%", align: "right", truncate: true },
        { key: "createdAt", label: "作成日", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "action", label: "操作", width: isMobile ? "35%" : "10%", align: "center" },
    ];



    const deleteMutation = useMutation({
        mutationFn: async (id: number) => ApiService.deletePurchaseOrder(id),
        onSuccess: () => {
            setOpenDeleteConfirm(false);
            setSelectedPurchaseOrderId(0);
            showSnackbar("orderを削除しました", "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || "削除に失敗しました", "error");
        }
    });

    const handleDelete = (id: number) => {
        setSelectedPurchaseOrderId(id)
        setOpenDeleteConfirm(true)
    }


    return (
        <Box m={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header title="購入一覧:" subtitle="購入情報の一覧表示" />
                )}
                <Box mt={4}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => navigate(`/purchase-order/create`)}
                    >
                        新規購入注文
                    </Button>

                </Box>

            </Box>

            <Box height="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />

                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}

                {error && <p className="error">データの取得に失敗しました。</p>}

                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            mb: 3,
                            maxHeight: '75vh',
                            overflowY: 'auto',
                        }}
                    >
                        <Table stickyHeader sx={{ backgroundColor: colors.primary[400], tableLayout: "fixed" }}>
                            <colgroup>
                                {columns.map(
                                    (col) => (!isMobile || !col.hideOnMobile ? <col key={col.key} style={{ width: col.width }} /> : null)
                                )}
                            </colgroup>

                            <TableHead>
                                <TableRow
                                    sx={{
                                        "& .MuiTableCell-root": {
                                            fontWeight: "bold",
                                            backgroundColor: colors.blueAccent[500],
                                            color: colors.grey[100],
                                        },

                                    }}
                                >
                                    {columns.map(
                                        (col) =>
                                            !isMobile || !col.hideOnMobile ? (
                                                <TableCell key={col.key} sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}>
                                                    {col.label}
                                                </TableCell>
                                            ) : null
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {resPO.length > 0 ? (
                                    resPO.map((order) => (
                                        <TableRow key={order.id}>
                                            {columns.map((col) => {
                                                if (isMobile && col.hideOnMobile) return null;

                                                let content;
                                                switch (col.key) {
                                                    case "status":
                                                        content = renderStatusChip(order.status);
                                                        break;
                                                    case "action":
                                                        content = (
                                                            <>
                                                                <IconButton
                                                                    aria-label="info"
                                                                    sx={{
                                                                        "&:hover": {
                                                                            color: "lightblue",
                                                                            backgroundColor: "transparent",
                                                                        },
                                                                        transition: "color 0.2s ease",
                                                                    }}
                                                                    onClick={() => navigate(`/purchase-order/${order.id}`)}
                                                                >
                                                                    <InfoIcon />
                                                                </IconButton>
                                                                {!isMobile && (
                                                                    <IconButton
                                                                        aria-label="delete"
                                                                        sx={{
                                                                            "&:hover": {
                                                                                color: "red",
                                                                                backgroundColor: "transparent",
                                                                            },
                                                                            transition: "color 0.2s ease",
                                                                        }}
                                                                        onClick={() => handleDelete(Number(order.id))}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                )}
                                                            </>
                                                        );
                                                        break;
                                                    case "total":
                                                        content = `¥${order.total.toLocaleString()}`;
                                                        break;
                                                    default:
                                                        content = (order as any)[col.key];
                                                }

                                                return (
                                                    <TableCell key={col.key} sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}>
                                                        {content}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isMobile ? 4 : 7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            該当する商品がありません
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <DeleteConfirmDialog
                    open={openDeleteConfirm}
                    onClose={() => setOpenDeleteConfirm(false)}
                    onDelete={() =>
                        selectedPurchaseOrderId &&
                        deleteMutation.mutate(Number(selectedPurchaseOrderId) || 0)}
                    isDeleting={deleteMutation.isPending}
                    targetName={`${selectedPurchaseOrderId}の注文`}
                    title="購入注文"
                />

            </Box>
        </Box>
    );
};

export default PurchaseOrderPage;
