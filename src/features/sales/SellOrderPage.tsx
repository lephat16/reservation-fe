import {
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
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
import { styledTable } from "../../shared/styles/StyleTable";
import type { Column } from "../purchases/PurchaseOrderPage";
import type { Order } from "../products/AllProductsPage";
import { useMemo, useState } from "react";
import type { SaleOrderData } from "./types/sell";
import { ORDER_STATUS } from "../../constants/status";
import { TablePaginationActions } from "../../shared/components/pagination/PaginationAction";
import { styledSelect } from "../../shared/styles/styledSelect";
import { blue, red } from "@mui/material/colors";
import SearchBar from "../../shared/components/global/SearchBar";

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
// ステータスに応じたChipを表示する関数
const renderStatusChip = (status: keyof typeof ORDER_STATUS) => {
    return <Chip
        label={ORDER_STATUS[status].label}
        color={ORDER_STATUS[status].color}
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

    // ソート用state
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<'id' | 'total' | 'createdAt'>('createdAt');
    // フィルターや選択状態のstate
    const [selectedStatus, setSelectedStatus] = useState<keyof typeof ORDER_STATUS | "">("");
    const [searchText, setSearchText] = useState<string>("");
    // SaleOrderデータの取得
    const { isLoading, error, data } = useSaleOrders();

    // ページネーション
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // テーブルの列定義
    const columns: Column[] = [
        { key: "id", label: "ID", width: isMD ? "10%" : "5%", sortable: true },
        { key: "customerName", label: "顧客", width: isMD ? "35%" : "15%", truncate: true },
        { key: "status", label: "ステータス", width: isMD ? "30%" : "10%", align: "center", truncate: true },
        { key: "userName", label: "ユーザー", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "total", label: isMD ? "合計" : "合計金額", width: isMD ? "30%" : "10%", align: "right", truncate: true, sortable: true },
        { key: "createdAt", label: "作成日", width: "15%", align: "center", truncate: true, hideOnMobile: true, sortable: true },
        { key: "action", label: "操作", width: isMD ? "35%" : "15%", align: "center" },
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

    // 検索フィルター
    const filterdSearch = data?.filter(item => {
        if (searchText) {
            return (
                item.customerName.toLowerCase().includes(searchText.toLowerCase()))
        }
        return true;
    });

    // ステータスフィルター
    const filteredStatus = filterdSearch?.filter(item =>
        selectedStatus === "" || item.status === selectedStatus
    );

    // ソート
    const sortedData = useMemo(() => {
        if (!filteredStatus) return [];
        const getValue = (item: SaleOrderData) => {
            switch (orderBy) {
                case 'id':
                    return Number(item.id);
                case 'total':
                    return item.total;
                case 'createdAt':
                    return new Date(item.createdAt).getTime();
                default:
                    return 0;
            }
        }
        return [...filteredStatus].sort((a, b) => {
            const valA = getValue(a);
            const valB = getValue(b);

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;

        })
    }, [filteredStatus, order, orderBy]);

    // ページネーション用の空行数
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedData.length - page * rowsPerPage);
    return (
        <Box m={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header title="販売一覧:" subtitle="販売情報の一覧表示" />
                )}
                <Box mt={4} >
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

            {/** メインコンテンツ領域 */}
            <Box height="75vh">
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={80} />
                ) : (
                    <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" gap={1}>
                            {/** ステータスフィルター */}
                            <FormControl sx={{ m: 1, width: { lg: 150, xs: 120 } }}>
                                <InputLabel
                                    id="multiple-status-label"
                                    sx={{
                                        color: colors.grey[100],
                                        '&.Mui-focused': {
                                            color: colors.grey[200],
                                        },
                                    }}
                                >
                                    ステータス
                                </InputLabel>
                                <Select
                                    labelId="multiple-status-label"
                                    id="multiple-status"
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        const value = e.target.value ? e.target.value : "";
                                        setSelectedStatus(value);
                                    }}
                                    input={<OutlinedInput label="ステータス" />}
                                    sx={styledSelect}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: colors.blueAccent[800],
                                                color: colors.grey[100],
                                                minWidth: 200,
                                                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>未選択</em>
                                    </MenuItem>
                                    {Object.values(ORDER_STATUS).map((status) => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {status.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                        {/** 検索バー */}
                        <SearchBar
                            value={searchText}
                            onChange={setSearchText}
                            sx={{ pr: "0 !important" }}
                        />
                    </Stack>
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Box mt={1}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                height: "100%"
                            }}
                        >
                            <Table
                                sx={{
                                    tableLayout: "fixed",
                                    ...styledTable(colors),
                                }}>
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
                                                    <TableCell
                                                        key={col.key}
                                                        sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}
                                                        sortDirection={col.sortable && orderBy === col.key ? order : false}
                                                    >
                                                        {col.sortable ? (
                                                            <TableSortLabel
                                                                active={orderBy === col.key}
                                                                direction={orderBy === col.key ? order : 'asc'}
                                                                onClick={() => {
                                                                    const isAsc = orderBy === col.key && order === 'asc';
                                                                    setOrder(isAsc ? 'desc' : 'asc');
                                                                    setOrderBy(col.key);
                                                                }}
                                                            >
                                                                {col.label}
                                                            </TableSortLabel>
                                                        ) : (col.label)}
                                                    </TableCell>
                                                ) : null
                                        )}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {sortedData
                                        .slice(
                                            page * rowsPerPage,
                                            rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : sortedData.length
                                        ).map((order) => (
                                            <TableRow key={order.id}>
                                                {columns.map((col) => {
                                                    if (isMD && col.hideOnMobile) return null;
                                                    let displayContent: React.ReactNode;
                                                    let tooltipText: string = "";
                                                    switch (col.key) {
                                                        case "status":
                                                            displayContent = renderStatusChip(order.status);
                                                            tooltipText = order.status;
                                                            break;
                                                        case "action":
                                                            displayContent = (
                                                                <>
                                                                    <IconButton
                                                                        aria-label="info"
                                                                        sx={{
                                                                            "&:hover": {
                                                                                color: theme.alpha(blue[800], 1),
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
                                                                                            color: theme.alpha(red[800], 1),
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
                                                            displayContent = `¥${order.total.toLocaleString()}`;
                                                            tooltipText = String(displayContent);;
                                                            break;
                                                        case "createdAt":
                                                            const createdAt = new Date(order.createdAt);
                                                            displayContent = createdAt.toLocaleDateString();
                                                            tooltipText = createdAt.toLocaleString();
                                                            break;
                                                        default:
                                                            displayContent = order[col.key as keyof SaleOrder];
                                                            tooltipText = String(displayContent ?? "");
                                                    }

                                                    return (
                                                        <TableCell key={col.key} sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}>
                                                            {tooltipText ? (
                                                                <Tooltip title={tooltipText}>
                                                                    <span>{displayContent}</span>
                                                                </Tooltip>
                                                            ) : (
                                                                displayContent
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))
                                    }
                                    {/** データがない場合 */}
                                    {sortedData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={isMD ? 5 : 7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                該当する商品がありません
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {/** 空行の埋め合わせ */}
                                    {emptyRows > 0 && Array.from(Array(emptyRows)).map((_, index) => (
                                        <TableRow key={`empty-${index}`} style={{ height: 53 }}>
                                            <TableCell colSpan={isMD ? 5 : 7} />
                                        </TableRow>
                                    ))}
                                </TableBody>

                                {/** ページネーション */}
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={([5, 10])}
                                            colSpan={7}
                                            count={sortedData?.length || 0}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            slotProps={{
                                                select: {
                                                    inputProps: {
                                                        'aria-label': 'rows per page',
                                                    },
                                                    native: true,
                                                },
                                            }}
                                            onPageChange={(_, newPage) => setPage(newPage)}
                                            onRowsPerPageChange={(event) => {
                                                setRowsPerPage(parseInt(event.target.value, 10));
                                                setPage(0);
                                            }}
                                            ActionsComponent={TablePaginationActions}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

            </Box>

        </Box >
    )
}

export default SellOrderPage