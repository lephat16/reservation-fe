import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Drawer,
    IconButton,
    Paper,
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
    Typography,
    useTheme
} from "@mui/material";
import { tokens } from "../../../shared/theme";
import type { StockHistoriesWithDetailData } from "../types/stock";
import { useQuery } from "@tanstack/react-query";
import { stockAPI } from "../api/stockAPI";
import Header from "../../../shared/components/layout/Header";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { styledTable } from "../../../shared/components/global/StyleTable";
import type { TableCellProps } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../shared/components/global/SearchBar";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import isoWeek from "dayjs/plugin/isoWeek";
import dayjs, { Dayjs } from "dayjs";
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MovingIcon from '@mui/icons-material/Moving';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import CategoryIcon from '@mui/icons-material/Category';
import { BarChart } from '@mui/x-charts/BarChart';
import _ from "lodash";
import { LineChart, } from "@mui/x-charts";
import FilterContent from "./FilterContent";

export type Type = "IN" | "OUT" | "ALL";
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

    const { snackbar, closeSnackbar } = useSnackbar();
    const { isSM, isLG } = useScreen();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState<Type>("ALL");
    const [minQty, setMinQty] = useState(0);

    const [tempType, setTempType] = useState<Type>("ALL");
    const [tempMinQty, setTempMinQuty] = useState(0);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof StockRow>("date");

    const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const { isLoading, error, data } = useQuery<StockHistoriesWithDetailData[]>({
        queryKey: ["stock-histories-with-details"],
        queryFn: async () => {
            const resCategories = await stockAPI.getAllStockHistoriesWithDetails();
            return resCategories.data;
        },

    });

    // フィルタDrawerを開く
    const handleOpenDrawer = () => {
        setTempType(type);
        setTempMinQuty(minQty);
        setOpenFilterDrawer(true);
    };

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
                const matchesKeyword = !keyword || row.product.toLowerCase().includes(keyword.toLowerCase());
                const matchesType = type === "ALL" || row.type === type;
                const matchesQty = !minQty || Math.abs(Number(row.qty)) >= Number(minQty);
                const matchesDate = (!startDate || dayjs(row.date).isAfter(startDate, "day")) &&
                    (!endDate || dayjs(row.date).isBefore(endDate, "day"));
                return matchesKeyword && matchesType && matchesQty && matchesDate;
            });

    }, [data, keyword, type, minQty, startDate, endDate]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let valA = getSortValue(a, orderBy);
            let valB = getSortValue(b, orderBy);

            if (orderBy === "qty") {
                valA = Math.abs(Number(valA));
                valB = Math.abs(Number(valB));
            }
            if (typeof valA === "string") valA = valA.toString();
            if (typeof valB === "string") valB = valB.toString();

            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;

            return 0;
        })
    }, [filteredData, orderBy, order]);

    const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? [];
    useEffect(() => {
        setPage(0);
    }, [filteredData, sortedData]);
    dayjs.extend(isoWeek);

    const dataWithWeek = data?.map(row => ({
        ...row,
        week: dayjs(row.createdAt).isoWeek(),
        year: dayjs(row.createdAt).year(),
    }));

    const weeklyTotals = _(dataWithWeek)
        .groupBy(row => `${row.year}-W${row.week}`)
        .map((rows, week) => {
            const totalIn = rows.filter(r => r.type === "IN").reduce((sum, r) => sum + r.changeQty, 0);
            const totalOut = rows.filter(r => r.type === "OUT").reduce((sum, r) => sum + r.changeQty, 0);
            return { week, totalIn, totalOut };
        })
        .orderBy(['week'], ['asc'])
        .value();

    const currentWeek = dayjs().isoWeek();
    const currentYear = dayjs().year();

    const thisWeekKey = `${currentYear}-W${currentWeek}`;
    const thisWeekData = weeklyTotals.find(w => w.week === thisWeekKey);

    const past4WeeksData = weeklyTotals
        .filter(w => {
            const [year, weekStr] = w.week.split("-W").map(Number);
            return (year === currentYear) && (weekStr < currentWeek) && (weekStr >= currentWeek - 4);
        });
    const avgInPast4Weeks = past4WeeksData.length
        ? past4WeeksData.reduce((sum, w) => sum + w.totalIn, 0) / past4WeeksData.length
        : 0;

    const avgOutPast4Weeks = past4WeeksData.length
        ? past4WeeksData.reduce((sum, w) => sum + w.totalOut, 0) / past4WeeksData.length
        : 0;

    const inPercentChange = thisWeekData && avgInPast4Weeks
        ? ((thisWeekData.totalIn - avgInPast4Weeks) / avgInPast4Weeks) * 100
        : 0;

    const outPercentChange = thisWeekData && avgOutPast4Weeks
        ? ((thisWeekData.totalOut - avgOutPast4Weeks) / avgOutPast4Weeks) * 100
        : 0;

    const totalQtyIn = data?.filter(row => row.type === "IN")
        .reduce((sum, row) => sum + row.changeQty, 0);

    const totalQtyOut = data?.filter(row => row.type === "OUT")
        .reduce((sum, row) => sum + row.changeQty, 0);

    const productTotals = data?.reduce((acc, row) => {
        if (!acc[row.productName]) acc[row.productName] = { totalIn: 0, totalOut: 0, code: row.code };
        if (row.type === "IN") acc[row.productName].totalIn += row.changeQty;
        if (row.type === "OUT") acc[row.productName].totalOut += row.changeQty;
        return acc;
    }, {} as Record<string, { totalIn: number; totalOut: number; code: string }>);

    const productsArray = Object.entries(productTotals || {}).map(([productName, totals]) => ({
        productName,
        ...totals
    }));

    const topInProduct = productsArray.reduce((prev, curr) =>
        curr.totalIn > prev.totalIn ? curr : prev, { productName: "", totalIn: 0, totalOut: 0, code: "" });

    const topOutProduct = productsArray.reduce((prev, curr) =>
        curr.totalOut > prev.totalOut ? curr : prev, { productName: "", totalIn: 0, totalOut: 0, code: "" });

    const warehouseTotals = _(data)
        .groupBy('warehouseName')
        .map((rows, warehouse) => {
            const totalIn = rows.filter(r => r.type === "IN")
                .reduce((sum, r) => sum + r.changeQty, 0);
            const totalOut = rows.filter(r => r.type === "OUT")
                .reduce((sum, r) => sum + r.changeQty, 0);
            return { warehouse, totalIn, totalOut };
        })
        .value();

    const monthlyProfit = _(data)
        .groupBy(row => dayjs(row.createdAt).format('YYYY-MM'))
        .map((rows, month) => {
            const revenue = rows
                .filter(r => r.type === 'OUT')
                .reduce((sum, r) => sum + r.changeQty * r.price, 0);

            const cost = rows
                .filter(r => r.type === 'IN')
                .reduce((sum, r) => sum + r.changeQty * r.price, 0);

            return {
                month,
                revenue,
                cost,
                profit: revenue - cost
            };
        })
        .orderBy(['month'], ['asc'])
        .value();

    const profitByMonthDataset = monthlyProfit.map(item => ({
        date: dayjs(item.month, 'YYYY-MM').toDate(),
        profit: item.profit
    }));
    profitByMonthDataset.forEach(d => console.log(d.date, d.date instanceof Date));

    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title="取引履歴"
                    subtitle="取引情報の一覧表示"
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
                <Box
                    display="flex"
                    gap={1}
                    sx={{
                        flexDirection: {
                            xs: 'column',
                            xl: 'row',
                        }
                    }}
                >
                    <Box flex={2}>
                        <Box display="flex" gap={1}>
                            <Card
                                sx={{
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    display: "flex",
                                    width: 160
                                }}
                            >
                                <Box
                                    minWidth={140}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    flexGrow={1}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flex: 1,
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Stack direction="row" gap={2} justifyContent="space-between">
                                            <ArchiveIcon sx={{ fontSize: 50 }} color="info" />
                                            <Stack direction="column">
                                                <Stack direction="row" gap={1}>
                                                    {inPercentChange >= 0 ? (
                                                        <MovingIcon color="success" sx={{ fontSize: 24 }} />
                                                    ) : (
                                                        <TrendingDownIcon color="error" sx={{ fontSize: 24 }} />
                                                    )}
                                                    <Typography
                                                        alignContent="center"
                                                        variant="subtitle2"
                                                        color={inPercentChange >= 0 ? 'success.main' : 'error.main'}
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        {inPercentChange >= 0 ? `+${inPercentChange.toFixed(1)}%` : `${inPercentChange.toFixed(1)}%`}
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    textAlign="center"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        lineHeight: 1,
                                                        fontSize: { xl: '0.2rem', xs: '0.6rem' }
                                                    }}
                                                >今週</Typography>
                                                <Typography
                                                    textAlign="center"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        lineHeight: 1.2,
                                                        fontSize: {
                                                            xl: '0.4rem',
                                                            xs: '1.2rem'
                                                        },
                                                    }}
                                                >
                                                    {thisWeekData?.totalIn || 0}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Typography
                                            component="div"
                                            sx={{
                                                fontSize: {
                                                    xl: '1rem',
                                                    xs: '2rem'
                                                },
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {totalQtyIn}
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="success"
                                        >
                                            入庫合計
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                            <Card
                                sx={{
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    display: "flex",
                                    width: 160
                                }}
                            >
                                <Box
                                    minWidth={140}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    flexGrow={1}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flex: 1,
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Stack direction="row" gap={2} justifyContent="space-between">
                                            <UnarchiveIcon sx={{ fontSize: 50 }} color="info" />
                                            <Stack direction="column">
                                                <Stack direction="row" gap={1}>
                                                    {outPercentChange >= 0 ? (
                                                        <MovingIcon color="success" sx={{ fontSize: 24 }} />
                                                    ) : (
                                                        <TrendingDownIcon color="error" sx={{ fontSize: 24 }} />
                                                    )}
                                                    <Typography
                                                        alignContent="center"
                                                        variant="subtitle2"
                                                        color={outPercentChange >= 0 ? 'success.main' : 'error.main'}
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        {outPercentChange >= 0 ? `+${outPercentChange.toFixed(1)}%` : `${outPercentChange.toFixed(1)}%`}
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    textAlign="center"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        lineHeight: 1,
                                                        fontSize: { xl: '0.2rem', xs: '0.6rem' }
                                                    }}
                                                >今週</Typography>
                                                <Typography
                                                    textAlign="center"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        lineHeight: 1.2,
                                                        fontSize: {
                                                            xl: '0.4rem',
                                                            xs: '1.2rem'
                                                        },
                                                    }}
                                                >
                                                    {thisWeekData?.totalOut || 0}
                                                </Typography>

                                            </Stack>
                                        </Stack>
                                        <Typography
                                            component="div"
                                            sx={{
                                                fontSize: {
                                                    xl: '1rem',
                                                    xs: '2rem'
                                                },
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {totalQtyOut}
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="success"
                                        >
                                            出庫合計
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                            <Card
                                sx={{
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    display: "flex",
                                    width: 160
                                }}
                            >
                                <Box
                                    minWidth={140}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    flexGrow={1}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flex: 1,
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Stack direction="row" gap={2} justifyContent="space-between">
                                            <CategoryIcon sx={{ fontSize: 50 }} color="info" />
                                            <Tooltip
                                                title={topInProduct.productName}
                                                arrow
                                                slotProps={{
                                                    popper: {
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [0, -20]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{ fontWeight: 'bold', textAlign: 'center' }}
                                                    color="warning"
                                                    alignContent="center"
                                                >
                                                    {topInProduct.code}
                                                </Typography>
                                            </Tooltip>
                                        </Stack>
                                        <Typography
                                            component="div"
                                            sx={{
                                                fontSize: {
                                                    xl: '1rem',
                                                    xs: '2rem'
                                                },
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {topInProduct.totalIn}
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="success"
                                        >
                                            入庫最多商品
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                            <Card
                                sx={{
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    display: "flex",
                                    width: 160
                                }}
                            >
                                <Box
                                    minWidth={140}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    flexGrow={1}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flex: 1,
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Stack direction="row" gap={2} justifyContent="space-between">
                                            <CategoryIcon sx={{ fontSize: 50 }} color="info" />
                                            <Tooltip
                                                title={topInProduct.productName}
                                                arrow
                                                slotProps={{
                                                    popper: {
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [0, -20]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{ fontWeight: 'bold', textAlign: 'center' }}
                                                    color="warning"
                                                    alignContent="center"
                                                >
                                                    {topOutProduct.code}
                                                </Typography>
                                            </Tooltip>
                                        </Stack>
                                        <Typography
                                            component="div"
                                            sx={{
                                                fontSize: {
                                                    xl: '1rem',
                                                    xs: '2rem'
                                                },
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {topOutProduct.totalOut}
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="success"
                                        >
                                            出庫最多商品
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mt={1}>
                            {isLG ? (
                                <IconButton
                                    color="primary"
                                    onClick={handleOpenDrawer}
                                    aria-label="フィルター"
                                >
                                    <FilterListIcon />
                                </IconButton>
                            ) : (

                                <Stack direction="row">
                                    <Stack direction="row">
                                        <FilterContent
                                            type={type}
                                            setType={setType}
                                            minQty={minQty}
                                            setMinQty={setMinQty}
                                            sx={{ m: 1, ml: 0, width: { lg: 150, xs: 120 } }}
                                        />
                                    </Stack>
                                    <Stack direction="row">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="開始日"
                                                value={startDate}
                                                onChange={(newValue) => setStartDate(newValue)}
                                                sx={{ m: 1, maxWidth: 160, }}
                                                slotProps={{
                                                    desktopPaper: {
                                                        style: {
                                                            backgroundColor: colors.blueAccent[800],
                                                        },
                                                    }
                                                }}
                                            />
                                            <DatePicker
                                                label="終了日"
                                                value={endDate}
                                                onChange={(newValue) => setEndDate(newValue)}
                                                sx={{ m: 1, maxWidth: 160 }}
                                                slotProps={{
                                                    desktopPaper: {
                                                        style: {
                                                            backgroundColor: colors.blueAccent[800],
                                                        },
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Stack>
                                </Stack>
                            )}

                            <SearchBar
                                value={keyword}
                                onChange={setKeyword}
                                sx={{ p: "0 !important" }}
                            />
                            <Drawer
                                anchor="left"
                                open={openFilterDrawer}
                                onClose={() => setOpenFilterDrawer(false)}
                                slotProps={{
                                    paper: {
                                        style: {
                                            width: '40vw',
                                            backgroundColor: colors.primary[400]
                                        }
                                    }
                                }}
                            >
                                <Box p={2} display="flex" flexDirection="column" height="100%">
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6">フィルター</Typography>
                                        <IconButton onClick={() => setOpenFilterDrawer(false)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <FilterContent
                                        type={tempType}
                                        setType={setTempType}
                                        minQty={tempMinQty}
                                        setMinQty={setTempMinQuty}
                                        sx={{ mt: 2 }}
                                    />
                                    <Box mt="auto" display="flex" justifyContent="space-between" py={2}>
                                        <Button variant="outlined" onClick={() => setOpenFilterDrawer(false)}>キャンセル</Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setType(tempType);;
                                                setMinQty(tempMinQty)
                                                setOpenFilterDrawer(false);
                                            }}
                                        >
                                            適用
                                        </Button>
                                    </Box>
                                </Box>
                            </Drawer>
                        </Box>
                        {
                            isLoading ? (
                                <Skeleton variant="rectangular" height={400} />
                            ) : (
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        maxHeight: "75vh",
                                        minWidth: { xs: 308, lg: 600 },
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
                                                    (isLG && col.hideOnMobile) ? null : (
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
                                                                (isLG && col.hideOnMobile) ? null : (
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
                                                    colSpan={isLG ? 6 : 11}
                                                    align="center"
                                                    sx={{ py: 4, color: "text.secondary" }}>
                                                    該当するデータがありません
                                                </TableCell>
                                            )}

                                        </TableBody>

                                        <TableFooter>
                                            <TableRow>
                                                <TablePagination
                                                    count={sortedData?.length || 0}
                                                    page={page}
                                                    rowsPerPage={rowsPerPage}
                                                    onPageChange={(_, newPage) => setPage(newPage)}
                                                    onRowsPerPageChange={(e) => {
                                                        setRowsPerPage(parseInt(e.target.value, 10));
                                                        setPage(0);
                                                    }}
                                                    rowsPerPageOptions={[10, 20, 50]}
                                                    colSpan={isLG ? 6 : 11}
                                                />
                                            </TableRow>
                                        </TableFooter>

                                    </Table>
                                </TableContainer>
                            )
                        }
                    </Box>
                    <Box flex={1}>
                        <BarChart
                            dataset={warehouseTotals.map(wh => ({
                                warehouse: wh.warehouse,
                                inQty: wh.totalIn,
                                outQty: wh.totalOut
                            }))}
                            xAxis={[{ dataKey: 'warehouse' }]}
                            yAxis={[
                                {
                                    label: "数量",
                                    width: 60,
                                }
                            ]}
                            series={[
                                { dataKey: 'inQty', label: '入庫' },
                                { dataKey: 'outQty', label: '出庫' },
                            ]}
                            height={300}
                            spacing={0.3}
                        />

                        <LineChart
                            dataset={profitByMonthDataset}
                            xAxis={[
                                {
                                    dataKey: 'date',
                                    scaleType: 'time',
                                    // tickNumber: profitByMonthDataset.length,
                                    valueFormatter: (date: Date, context) => {
                                        if (context.location === 'tick') {
                                            return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
                                        }
                                        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
                                    },
                                }
                            ]}
                            yAxis={[
                                {
                                    id: 'profit-axis',
                                    scaleType: 'linear',
                                    valueFormatter: (val) => val.toLocaleString() + '円',
                                    width: 100
                                }
                            ]}
                            series={[
                                {
                                    type: 'line',
                                    dataKey: 'profit',
                                    label: '利益',
                                    showMark: true,
                                }
                            ]}
                            height={300}
                            grid={{ vertical: true, horizontal: true }}
                        />
                    </Box>
                </Box>

            </Box >
        </Box >
    )
}

export default StockMovementHistoryPage