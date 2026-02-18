import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    useTheme,
    type SxProps,
    type Theme
} from "@mui/material";
import { tokens } from "../../shared/theme";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../../shared/components/layout/Header";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { DeleteConfirmDialog } from "../../shared/components/global/DeleteConfirmDialog";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { saleAPI } from "./api/saleAPI";
import { useSaleOrders } from "./hooks/useSaleOrders";
import { useScreen } from "../../shared/hooks/ScreenContext";
import useRoleFlags from "../auth/hooks/useRoleFlags";
import { getErrorMessage } from "../../shared/utils/errorHandler";

const renderStatusChip = (status: string) => {
    const colorMap: Record<string, "secondary" | "primary" | "success" | "warning" | "error"> = {
        NEW: "secondary",
        PENDING: "warning",
        PROCESSING: "primary",
        COMPLETED: "success",
        CANCELLED: "error",
    };
    return <Chip
        label={status}
        color={colorMap[status] || "primary"}
        sx={{
            width: 100
        }}
    />;
};

const cellStyle = (align?: "right" | "center", truncate?: boolean): SxProps<Theme> => ({
    textAlign: align,
    whiteSpace: truncate ? "nowrap" : "normal",
    overflow: truncate ? "hidden" : "visible",
    textOverflow: truncate ? "ellipsis" : "clip",
});

const SellOrderPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { isMD, isSM } = useScreen();
    const navigate = useNavigate();

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [selectedSellOrderId, setSelectedSellOrderId] = useState(0);

    const queryClient = useQueryClient();
    const { isAdmin, isStaff, isWarehouse } = useRoleFlags();
    const { isLoading, error, data } = useSaleOrders();

    const columns = [
        { key: "id", label: "ID", width: isMD ? "10%" : "5%" },
        { key: "customerName", label: "顧客", width: isMD ? "35%" : "15%", truncate: true },
        { key: "status", label: "ステータス", width: isMD ? "30%" : "10%", align: "center", truncate: true },
        { key: "userName", label: "ユーザー", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "total", label: isMD ? "合計" : "合計金額", width: isMD ? "30%" : "10%", align: "right", truncate: true },
        { key: "createdAt", label: "作成日", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "action", label: "操作", width: isMD ? "35%" : "10%", align: "center" },
    ];

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => saleAPI.deleteSellOrder(id),
        onSuccess: (response) => {
            setOpenDeleteConfirm(false);
            setSelectedSellOrderId(0);
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleDelete = (id: number) => {
        setSelectedSellOrderId(id)
        setOpenDeleteConfirm(true)
    }
    return (
        <Box m={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header title="販売一覧:" subtitle="販売情報の一覧表示" />
                )}
                <Box mt={4}>
                    {(isAdmin || isStaff) && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => navigate(`/sell-order/create`)}
                        >
                            新規販売注文
                        </Button>
                    )}
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
                    <ErrorState />
                )}
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
                                    (col) => (!isMD || !col.hideOnMobile ? <col key={col.key} style={{ width: col.width }} /> : null)
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
                                            !isMD || !col.hideOnMobile ? (
                                                <TableCell key={col.key} sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}>
                                                    {col.label}
                                                </TableCell>
                                            ) : null
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {data && data.length > 0 ? (
                                    data.map((order) => (
                                        <TableRow key={order.id}>
                                            {columns.map((col) => {
                                                if (isMD && col.hideOnMobile) return null;

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
                                                                    onClick={() => navigate(`/sell-order/${order.id}`)}
                                                                >
                                                                    <InfoIcon />
                                                                </IconButton>
                                                                {!isMD && (
                                                                    <Tooltip title={isWarehouse ? "管理者またはスタッフのみ削除可能" : "削除"}>
                                                                        <span>
                                                                            <IconButton
                                                                                aria-label="delete"
                                                                                sx={{
                                                                                    "&:hover": {
                                                                                        color: "red",
                                                                                        backgroundColor: "transparent",
                                                                                    },
                                                                                    transition: "color 0.2s ease",
                                                                                }}
                                                                                disabled={isWarehouse}
                                                                                onClick={() => handleDelete(Number(order.id))}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                )}
                                                            </>
                                                        );
                                                        break;
                                                    case "total":
                                                        content = `¥${order.total.toLocaleString()}`;
                                                        break;
                                                    case "createdAt":
                                                        const createdAt = new Date(order.createdAt);
                                                        content = createdAt.toLocaleDateString();

                                                        return (
                                                            <TableCell
                                                                key={col.key}
                                                                sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}
                                                            >
                                                                <Tooltip title={createdAt.toLocaleString()}>
                                                                    <span>{content}</span>
                                                                </Tooltip>
                                                            </TableCell>
                                                        );
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
                                        <TableCell colSpan={isMD ? 4 : 7} align="center" sx={{ py: 4, color: "text.secondary" }}>
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
                        selectedSellOrderId &&
                        deleteMutation.mutate(Number(selectedSellOrderId) || 0)}
                    isDeleting={deleteMutation.isPending}
                    targetName={`${selectedSellOrderId}の注文`}
                    title="販売注文"
                />
            </Box>

        </Box>
    )
}

export default SellOrderPage