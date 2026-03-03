import {
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    ListItemText,
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
    type SelectChangeEvent,
    type SxProps,
    type Theme
} from "@mui/material";
import Header from "../../shared/components/layout/Header";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokens } from "../../shared/theme";
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { purchaseAPI } from "./api/purchaseAPI";
import { usePurchaseOrders } from "./hooks/usePurchaseOrders";
import { useScreen } from "../../shared/hooks/ScreenContext";
import useRoleFlags from "../auth/hooks/useRoleFlags";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";
import { blue, red } from "@mui/material/colors";
import type { Order } from "../products/AllProductsPage";
import { useEffect, useMemo, useState, } from "react";
import type { PurchaseOrderData } from "./types/purchase";
import { styledSelect } from "../../shared/styles/styledSelect";
import { TablePaginationActions } from "../../shared/components/pagination/PaginationAction";
import { styledTable } from "../../shared/styles/StyleTable";
import { ORDER_STATUS } from "../../constants/status";
import SearchBar from "../../shared/components/global/SearchBar";
import { getCommonSlotProps } from "../../shared/components/pagination/TablePaginationHelper";

/** 
 * 購入一覧ページコンポーネント
 *
 * 発注情報の一覧をテーブル形式で表示する
 * ユーザー権限に応じて新規作成や削除、詳細確認が可能
 * 
 */
type PurchaseOrder = {
    id: number;
    supplierName: string;
    status: string;
    userName: string;
    total: number;
    createdAt: string;
}

type SortableKey = 'id' | 'total' | 'createdAt';
export type Column =
    | {
        key: SortableKey;
        label: string;
        width: string;
        sortable: true;
        align?: "right" | "center";
        truncate?: boolean;
        hideOnMobile?: boolean;
    }
    | {
        key: string;
        label: string;
        width: string;
        sortable?: false;
        align?: "right" | "center";
        truncate?: boolean;
        hideOnMobile?: boolean;
    };
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
// テーブルセルのスタイル関数（右寄せや省略表示など）
const cellStyle = (align?: "right" | "center", truncate?: boolean): SxProps<Theme> => ({
    textAlign: align,
    whiteSpace: truncate ? "nowrap" : "normal",
    overflow: truncate ? "hidden" : "visible",
    textOverflow: truncate ? "ellipsis" : "clip",
});

const PurchaseOrderPage = () => {

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { isMD, isSM } = useScreen();
    const navigate = useNavigate();
    const { isAdmin, isStaff, isWarehouse } = useRoleFlags();
    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const { confirmDelete } = useDialogs();

    // ソート用state
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<'id' | 'total' | 'createdAt'>('createdAt');

    // フィルターや選択状態のstate
    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<keyof typeof ORDER_STATUS | "">("");
    const [searchText, setSearchText] = useState<string>("");

    // データを取得
    const { isLoading, error, data } = usePurchaseOrders();
    // ページネーション
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // テーブル列定義
    const columns: Column[] = [
        { key: "id", label: "ID", width: isMD ? "10%" : "5%", sortable: true },
        { key: "supplierName", label: "仕入先", width: isMD ? "35%" : "15%", truncate: true },
        { key: "status", label: "ステータス", width: isMD ? "30%" : "10%", align: "center", truncate: true },
        { key: "userName", label: "ユーザー", width: "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "total", label: isMD ? "合計" : "合計金額", width: isMD ? "30%" : "10%", align: "right", truncate: true, sortable: true },
        { key: "createdAt", label: "作成日", width: "15%", align: "center", truncate: true, hideOnMobile: true, sortable: true },
        { key: "action", label: "操作", width: isMD ? "35%" : "15%", align: "center" },
    ];

    // 削除ミューテーション
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => purchaseAPI.deletePurchaseOrder(id),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleDelete = async (orderId: number) => {
        const ok = await confirmDelete(
            `注文「${orderId}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate(orderId);
        }
    }

    const uniqueSuppliers = useMemo(() => {
        const map = new Map();
        data?.forEach(s => {
            map.set(s.supplierId, s);
        });
        return Array.from(map.values());
    }, [data])

    const handleChangeSuppliers = (event: SelectChangeEvent<typeof suppliers>) => {
        const { target: { value } } = event;
        const CLEAR = '__CLEAR__';
        const values = typeof value === 'string' ? value.split(',') : value;
        if (value.includes(CLEAR)) {
            setSuppliers([]);
            return
        }
        setSuppliers(values.filter(v => v != ''));
    }

    // 検索フィルター
    const filterdSearch = data?.filter(item => {
        if (searchText) {
            return (
                item.supplierName.toLowerCase().includes(searchText.toLowerCase()))
        }
        return true;
    });

    // 仕入先フィルター
    const filteredSuppliersAndStatus = filterdSearch?.filter(item => {
        const matchStatus =
            selectedStatus === "" || item.status === selectedStatus;
        const matchSupplier =
            suppliers.length === 0 || suppliers.includes(item.supplierName);
        return matchStatus && matchSupplier;
    });

    // ソート
    const sortedData = useMemo(() => {
        if (!filteredSuppliersAndStatus) return [];
        const getValue = (item: PurchaseOrderData) => {
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
        return [...filteredSuppliersAndStatus].sort((a, b) => {
            const valA = getValue(a);
            const valB = getValue(b);

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;

        })
    }, [filteredSuppliersAndStatus, order, orderBy]);

    // フィルター結果の件数が変わった場合、ページを先頭（0ページ目）にリセットする
    useEffect(() => {
        setPage(0);
    }, [sortedData.length]);

    // ページネーション用の空行数
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedData.length - page * rowsPerPage);

    return (
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header title="購入一覧:" subtitle="購入情報の一覧表示" />
                )}
                <Box mt={4}>
                    {(isAdmin || isStaff) && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => navigate(`/purchase-order/create`)}
                        >
                            新規購入注文
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
                    <Stack direction="row" justifyContent="space-between" >
                        <Stack direction="row" gap={1}>
                            <FormControl sx={{ m: 1, ml: 0, width: { lg: 150, xs: 120 } }}>
                                <InputLabel
                                    id="multiple-suppliers-label"
                                    sx={{
                                        color: colors.grey[100],
                                        '&.Mui-focused': {
                                            color: colors.grey[200],
                                        },
                                    }}
                                >
                                    仕入先
                                </InputLabel>
                                <Select
                                    labelId="multiple-suppliers-label"
                                    id="multiple-suppliers"
                                    multiple
                                    value={suppliers}
                                    onChange={handleChangeSuppliers}
                                    input={<OutlinedInput label="仕入先" />}
                                    renderValue={(selected) => selected.join(', ')}
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
                                    <MenuItem value='__CLEAR__'>
                                        <em>未選択</em>
                                    </MenuItem>
                                    {uniqueSuppliers?.map(sup => (
                                        <MenuItem key={sup.supplierId} value={sup.supplierName}>
                                            <Checkbox
                                                checked={suppliers.includes(sup.supplierName)}
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: colors.grey[200],
                                                    },
                                                }}
                                            />
                                            <ListItemText primary={sup.supplierName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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
                                >ステータス</InputLabel>
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
                    // テーブル読み込みSkeleton
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
                                }}
                            >
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
                                                                    <Tooltip title="詳細">
                                                                        <IconButton
                                                                            aria-label="info"
                                                                            sx={{
                                                                                "&:hover": {
                                                                                    color: theme.alpha(blue[800], 1),
                                                                                    backgroundColor: "transparent",
                                                                                },
                                                                                transition: "color 0.2s ease",
                                                                            }}
                                                                            onClick={() => navigate(`/purchase-order/${order.id}`)}
                                                                        >
                                                                            <InfoIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
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
                                                            displayContent = order[col.key as keyof PurchaseOrder];
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
                                    {emptyRows > 0 && (
                                        <TableRow
                                            sx={{
                                                height: emptyRows * 53.56,
                                            }}
                                        >
                                            <TableCell colSpan={isMD ? 5 : 7} />
                                        </TableRow>
                                    )}
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
                                            slotProps={getCommonSlotProps(isSM)}
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
    );
};

export default PurchaseOrderPage;
