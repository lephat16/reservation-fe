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
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../../shared/components/layout/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { saleAPI } from "./api/saleAPI";
import { useSaleOrders } from "./hooks/useSaleOrders";
import { useScreen } from "../../shared/hooks/ScreenContext";
import useRoleFlags from "../auth/hooks/useRoleFlags";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";

/** 
 * 販売注文一覧ページコンポーネント
 * 販売注文のリスト表示、作成ボタン、詳細表示・削除操作を提供する
 * 
 * - 管理者・スタッフは新規販売注文作成が可能
 * - 各注文のステータスはChipで色分け表示
 * - 削除は確認ダイアログ経由で実行
 */

type SaleOrder = {
    id: number;
    customerName: string;
    status: string;
    userName: string;
    total: number;
    createdAt: string;
}
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

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { isMD, isSM } = useScreen();
    const navigate = useNavigate();
    const { confirmDelete } = useDialogs();
    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const { isAdmin, isStaff, isWarehouse } = useRoleFlags();

    // SaleOrderデータの取得
    const { isLoading, error, data } = useSaleOrders();

    // テーブルの列定義
    const columns = [
        { key: "id", label: "ID", width: isMD ? "10%" : "5%" },
        { key: "customerName", label: "顧客", width: isMD ? "35%" : "15%", truncate: true },
        { key: "status", label: "ステータス", width: isMD ? "30%" : "10%", align: "center", truncate: true },
        { key: "userName", label: "ユーザー", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "total", label: isMD ? "合計" : "合計金額", width: isMD ? "30%" : "10%", align: "right", truncate: true },
        { key: "createdAt", label: "作成日", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "action", label: "操作", width: isMD ? "35%" : "10%", align: "center" },
    ];

    // 販売注文削除用のMutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => saleAPI.deleteSellOrder(id),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    // 削除処理
    const handleDelete = async (id: number) => {
        const ok = await confirmDelete(
            `販売注文「${id}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate(id);
        }
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
                                                        content = order[col.key as keyof SaleOrder];
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

            </Box>

        </Box>
    )
}

export default SellOrderPage