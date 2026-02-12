import { Box, FormControl, InputLabel, MenuItem, OutlinedInput, Paper, Select, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import type { StockHistoriesWithDetailData } from "../types/stock";
import { useQuery } from "@tanstack/react-query";
import { stockAPI } from "../api/stockAPI";
import Header from "../../../pages/Header";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { styledTable } from "../../../shared/components/global/StyleTable";
import type { TableCellProps } from "@mui/material";
import { useMemo, useState } from "react";
import SearchBar from "../../../shared/components/global/SearchBar";
import { styledSelect } from "../../../shared/styles/styledSelect";
import type { keyof } from "@mui/x-charts/internals";

type Type = "IN" | "OUT" | "ALL";
type Order = 'asc' | 'desc';
type Column<T> = {
    key: keyof T;
    label: string;
    width?: string;
    align?: TableCellProps["align"];
    hideOnMobile?: boolean;
    sortable?: boolean;
};
type StockRow = {
    id: number;
    date: string;
    type: string;
    qty: number;
    before: number;
    after: number;
    product: string;
    warehouse: string;
    ref: string;
    price: string;
    priceRaw: number;
    total: string;
    totalRaw: number;
    user: string;
};
const columns: Column<StockRow>[] = [
    { key: "date", label: "日付", align: "center", width: "12%", sortable: true },
    { key: "type", label: "区分", align: "center", width: "6%" },
    { key: "qty", label: "数量", align: "right", width: "7%", sortable: true },
    { key: "before", label: "変更前", align: "right", width: "7%", hideOnMobile: true, sortable: true },
    { key: "after", label: "変更後", align: "right", width: "7%", sortable: true },
    { key: "product", label: "商品名", align: "center", width: "18%", },
    { key: "warehouse", label: "倉庫", align: "center", width: "14%", hideOnMobile: true },
    { key: "ref", label: "参照", align: "center", width: "10%", hideOnMobile: true },
    { key: "price", label: "単価", align: "right", width: "8%", hideOnMobile: true, sortable: true },
    { key: "total", label: "合計金額", align: "right", width: "10%", hideOnMobile: true, sortable: true },
    { key: "user", label: "担当者", align: "center", width: "9%" },
]

const StockMovementHistoryPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const { isMD, isSM } = useScreen();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState<Type>("ALL");
    const [minQty, setMinQty] = useState(0);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof StockRow>("date")

    const { isLoading, error, data } = useQuery<StockHistoriesWithDetailData[]>({
        queryKey: ["stock-histories-with-details"],
        queryFn: async () => {
            const resCategories = await stockAPI.getAllStockHistoriesWithDetails();
            return resCategories.data;
        },

    });

    const mapToStockRow = (row: StockHistoriesWithDetailData): StockRow => ({
        id: row.id,
        date: new Date(row.createdAt).toLocaleString(),
        type: row.type,
        qty: row.signedQty,
        before: row.beforeQty,
        after: row.afterQty,
        product: row.productName,
        warehouse: row.warehouseName,
        ref: `${row.refType}-${row.refId}`,
        price: new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "JPY",
        }).format(row.price ?? 0),
        priceRaw: row.price,
        total: (row.price * row.changeQty)?.toLocaleString(),
        totalRaw: (row.price * row.changeQty),
        user: row.userName,
    });
    const getSortValue = (row: StockRow, key: keyof StockRow) => {
        switch (key) {
            case "date":
                return row.date;
            case "qty":
                return row.qty;
            case "before":
                return row.before;
            case "after":
                return row.after;
            case "price":
                return row.priceRaw;
            case "total":
                return row.totalRaw;
            default:
                return "";
        }
    }
    const handleSort = (key: keyof StockRow) => {
        setOrder(prev =>
            orderBy === key
                ? (prev === "asc" ? "desc" : "asc")
                : "asc"
        );
        setOrderBy(key);
    }



    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.map(mapToStockRow)
            .filter(row => {
                return (!keyword || row.product.toLowerCase().includes(keyword.toLowerCase())) &&
                    (type === "ALL" || row.type === type) &&
                    (!minQty || row.qty >= Number(minQty))
            });

    }, [data, keyword, type, minQty]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let valA = getSortValue(a, orderBy);
            let valB = getSortValue(b, orderBy);

            if (typeof valA === "string") valA = valA.toString();
            if (typeof valB === "string") valB = valB.toString();

            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;

            return 0;
        })
    }, [filteredData, orderBy, order]);
    
    const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? [];
    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title="商品一覧"
                    subtitle="商品情報の一覧表示"
                />
            )}
            <Box
                mt={1}
                minHeight="75vh"
                height="auto"
            >
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
                <Box display="flex" justifyContent="space-between">
                    <Stack direction="row">
                        <FormControl sx={{ m: 1, ml: 0, width: { lg: 150, xs: 120 } }}>
                            <InputLabel
                                id="multiple-types-label"
                                sx={{
                                    color: colors.grey[100],
                                    '&.Mui-focused': {
                                        color: colors.grey[200],
                                    },
                                }}
                            >区分</InputLabel>
                            <Select
                                labelId="multiple-types-label"
                                id="multiple-types"
                                value={type}
                                onChange={e => {
                                    setType(e.target.value as Type)
                                    console.log(e.target.value)
                                }}
                                input={<OutlinedInput label="区分" />}
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
                                <MenuItem value="ALL">
                                    <em>全て</em>
                                </MenuItem>
                                <MenuItem value="IN">入庫</MenuItem>
                                <MenuItem value="OUT">出庫</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ m: 1, width: { lg: 150, xs: 120 } }}>
                            <InputLabel
                                id="multiple-qty-label"
                                sx={{
                                    color: colors.grey[100],
                                    '&.Mui-focused': {
                                        color: colors.grey[200],
                                    },
                                }}
                            >数量</InputLabel>
                            <Select
                                labelId="multiple-qty-label"
                                id="multiple-qty"
                                value={minQty}
                                onChange={(e) => {
                                    const value = e.target.value ? e.target.value : "";
                                    if (value === null) {
                                        setMinQty(value);
                                    } else setMinQty(Number(value));
                                }}
                                input={<OutlinedInput label="数量" />}
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
                                <MenuItem value={0}>
                                    <em>未選択</em>
                                </MenuItem>
                                <MenuItem value={5}>5以上</MenuItem>
                                <MenuItem value={10}>10以上</MenuItem>
                                <MenuItem value={20}>20以上</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <SearchBar
                        value={keyword}
                        onChange={setKeyword}
                        sx={{ p: "0 !important" }}
                    />
                </Box>
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: "75vh",
                            minWidth: { xs: 308, md: 600 },
                        }}>
                        <Table
                            sx={{
                                tableLayout: "fixed",
                                ...styledTable(colors),
                                "& .qty-in": {
                                    color: theme.palette.success.main,
                                    fontWeight: 600,
                                },
                                "& .qty-out": {
                                    color: theme.palette.error.main,
                                    fontWeight: 600,
                                },
                            }}
                        >

                            <TableHead>
                                <TableRow>
                                    {columns.map(col => (
                                        (isMD && col.hideOnMobile) ? null : (
                                            <TableCell
                                                key={col.key}
                                                align={col.align}
                                                width={col.width}
                                                sortDirection={orderBy === col.key ? order : false}
                                            >
                                                {col.sortable ? (
                                                    <TableSortLabel
                                                        active={orderBy === col.key}
                                                        direction={orderBy === col.key ? order : "asc"}
                                                        onClick={() => handleSort(col.key)}
                                                    >
                                                        {col.label}
                                                    </TableSortLabel>
                                                ) : (
                                                    col.label
                                                )}
                                            </TableCell>
                                        )
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map(row => {
                                        return (
                                            <TableRow key={row.id} hover>
                                                {columns.map(col =>
                                                    (isMD && col.hideOnMobile) ? null : (
                                                        <TableCell
                                                            key={col.key}
                                                            align={col.align}
                                                            className={
                                                                col.key === "qty"
                                                                    ? (row.type === "IN" ? "qty-in" : "qty-out")
                                                                    : undefined
                                                            }
                                                        >

                                                            <Tooltip title={String(row[col.key])}>
                                                                <Box
                                                                    sx={{
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {row[col.key] === "type"
                                                                        ? (row.type === "IN" ? "入庫" : "出庫")
                                                                        : row[col.key]}
                                                                </Box>
                                                            </Tooltip>
                                                        </TableCell>
                                                    )
                                                )}
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableCell
                                        colSpan={isMD ? 6 : 11}
                                        align="center"
                                        sx={{ py: 4, color: "text.secondary" }}>
                                        該当するデータがありません
                                    </TableCell>
                                )}

                            </TableBody>

                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        count={data?.length || 0}
                                        page={page}
                                        rowsPerPage={rowsPerPage}
                                        onPageChange={(_, newPage) => setPage(newPage)}
                                        onRowsPerPageChange={(e) => {
                                            setRowsPerPage(parseInt(e.target.value, 10));
                                            setPage(0);
                                        }}
                                        rowsPerPageOptions={[10, 20, 50]}
                                        colSpan={isMD ? 6 : 11}
                                    />
                                </TableRow>
                            </TableFooter>

                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    )
}

export default StockMovementHistoryPage