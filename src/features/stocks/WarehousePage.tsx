import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
} from "@mui/material"
import Header from "../../shared/components/layout/Header"
import { tokens } from "../../shared/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StockData, WarehouseFormData, WarehousesData, WarehouseWithTotalChangedQtyData } from "./types/stock";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useMemo, useState } from "react";
import WidgetsIcon from '@mui/icons-material/Widgets';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MovingIcon from '@mui/icons-material/Moving';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Battery20Icon from '@mui/icons-material/Battery20';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { PieChart } from '@mui/x-charts/PieChart';
import WarehouseForm from "./components/WarehouseForm";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { stockAPI } from "./api/stockAPI";
import { useWarehouses } from "./hooks/useWarehouses";
import { useWarehouseWithTotalQty } from "./hooks/useWarehouseWithTotalQty";
import { useScreen } from "../../shared/hooks/ScreenContext";
import { STATUS } from "../../constants/status";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";
import { type Order } from "../products/AllProductsPage";
import { TablePaginationActions } from "../../shared/components/pagination/PaginationAction";
import { getCommonSlotProps } from "../../shared/components/pagination/TablePaginationHelper";


type OrderBy = 'productName' | 'sku' | 'quantity' | 'reservedQuantity' | 'available'
const WarehousePage = () => {

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const { confirmDelete } = useDialogs();
    const { isSM, isLG } = useScreen();

    // ステート
    // ページネーションの状態管理
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 倉庫の作成・編集フォームの開閉状態
    const [openCreateWarehouseForm, setOpenCreateWarehouseForm] = useState(false);
    const [openEditWarehouseForm, setOpenEditWarehouseForm] = useState(false);

    // 選択中の倉庫情報とその在庫データ
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehousesData | undefined>(undefined);
    const [selectedWarehouseWithTotal, setSelectedWarehouseWithTotal] = useState<WarehouseWithTotalChangedQtyData | undefined>(undefined);
    const [currentWarehouseIndex, setCurrentWarehouseIndex] = useState<number>(0);
    const [addedWarehouseIndex, setAddedWarehouseIndex] = useState<number | null>(null);

    // ソートの順番と基準
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<OrderBy>('productName');

    // 倉庫データの取得
    const { isLoading: isLoadingWH, error: errorWH, data: dataWH } = useWarehouses();
    const { isLoading: isLoadingWHWithTotal, error: errorWHWithTotal, data: dataWHWithTotal } = useWarehouseWithTotalQty();

    // 倉庫の作成ミューテーション
    const createMutation = useMutation({
        mutationFn: async (data: WarehouseFormData) => {
            const resAddedWarehouse = await stockAPI.createWarehouse(data);
            setAddedWarehouseIndex(resAddedWarehouse.data.id);

            return resAddedWarehouse;
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["warehouses", "warehouses-with-total"] });

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        }
    });

    // 倉庫削除ミューテーション
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return stockAPI.deleteWarehouse(id);
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["warehouses", "warehouses-with-total"] });
            setCurrentWarehouseIndex(0);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    // 倉庫削除処理
    const handleDelete = async () => {
        const ok = await confirmDelete(
            `倉庫「${selectedWarehouse?.name}」を削除しますか`
        );
        if (ok && selectedWarehouse?.id) {
            deleteMutation.mutate(selectedWarehouse.id);
        }
    }

    // 倉庫更新ミューテーション
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: WarehouseFormData }) => {
            return stockAPI.updateWarehouse(id, data);
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["warehouses", "warehouses-with-total"] });
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        }
    });
    // 倉庫追加後のインデックス更新
    useEffect(() => {
        if (dataWH && addedWarehouseIndex) {
            const newIndex = dataWH.findIndex(w => w.id === addedWarehouseIndex);
            setCurrentWarehouseIndex(newIndex);
        }
    }, [addedWarehouseIndex, dataWH]);
    // 倉庫選択時の状態更新
    useEffect(() => {
        if (dataWH && dataWH.length > 0) {
            const firstWarehouse = dataWH[currentWarehouseIndex];
            if (firstWarehouse) {
                setSelectedWarehouse(firstWarehouse);
                const firstWarehouseWithTotal = dataWHWithTotal?.find(
                    wh => wh.id === firstWarehouse.id
                );
                setSelectedWarehouseWithTotal(firstWarehouseWithTotal);
            }
        }
    }, [dataWH, dataWHWithTotal, currentWarehouseIndex]);
    // 次の倉庫に移動
    const handleNextWarehouse = () => {
        if (dataWH && dataWH.length > 0) {
            const nextIndex = (currentWarehouseIndex + 1) % dataWH.length;
            setCurrentWarehouseIndex(nextIndex);
            const nextWarehouse = dataWH[nextIndex];
            setSelectedWarehouse(nextWarehouse);

            const nextWarehouseWithTotal = dataWHWithTotal?.find(
                wh => wh.id === nextWarehouse.id
            );
            setSelectedWarehouseWithTotal(nextWarehouseWithTotal);
        }
    };
    // 前の倉庫に移動
    const handleBackWarehouse = () => {
        if (dataWH && dataWH.length > 0) {
            const prevIndex = (currentWarehouseIndex - 1 + dataWH.length) % dataWH.length;
            setCurrentWarehouseIndex(prevIndex);
            const prevWarehouse = dataWH[prevIndex];
            setSelectedWarehouse(prevWarehouse);

            const prevWarehouseWithTotal = dataWHWithTotal?.find(
                (wh) => wh.id === prevWarehouse.id
            );
            setSelectedWarehouseWithTotal(prevWarehouseWithTotal);
        }
    };
    const stocks = selectedWarehouse?.stocks ?? [];
    // ページネーションの処理
    const handleChangePage = (
        _: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    // 空行の処理
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, stocks.length - page * rowsPerPage);
    // 合計数量の計算
    const totalQuantity = selectedWarehouse?.stocks
        .map(stock => stock.quantity)
        .reduce((sum, qty) => sum + qty, 0);
    // 他の指標（受領PO、出荷SO）の計算
    const totalReceivedPO = selectedWarehouseWithTotal?.totalReceivedPo ?? 0
    const totalReceivedPO7d = selectedWarehouseWithTotal?.totalReceivedPoInWeek ?? 0
    const percentPO7d = totalReceivedPO > 0
        ? (totalReceivedPO7d / totalReceivedPO) * 100
        : 0
    const totalDeliveredSo = selectedWarehouseWithTotal?.totalDeliveredSo ?? 0
    const totalDeliveredSo7d = selectedWarehouseWithTotal?.totalDeliveredSoInWeek ?? 0
    const percentSO7d = totalDeliveredSo > 0
        ? (totalDeliveredSo7d / totalDeliveredSo) * 100
        : 0
    const percentQty = totalQuantity && selectedWarehouse?.stockLimit
        ? (totalQuantity / selectedWarehouse.stockLimit) * 100
        : 0;

    const statusInfo =
        STATUS[selectedWarehouse?.status as keyof typeof STATUS] ?? {
            label: "不明",
            color: "default",
        };
    // ソート済みデータ
    const sortedFilteredData = useMemo(() => {
        const getValue = (item: StockData) => {
            switch (orderBy) {
                case 'productName':
                    return item.productName;
                case 'sku':
                    return item.sku || '';
                case 'quantity':
                    return item.quantity;
                case 'reservedQuantity':
                    return item.reservedQuantity;
                case 'available':
                    return item.quantity - item.reservedQuantity;
                default:
                    return 0;
            }
        };

        return [...stocks].sort((a, b) => {
            const valA = getValue(a);
            const valB = getValue(b);

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [stocks, order, orderBy]);
    return (
        <Box mx={3} mb={3}>
            {isLoadingWH ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title={`倉庫(${dataWH?.length ?? 0})`}
                    subtitle="倉庫の詳細情報を表示"
                />
            )}
            <Box
                mt={1}
                minHeight="75vh"
                height="auto"
            >
                {/* エラー表示 */}
                {(errorWH || errorWHWithTotal) && (
                    <ErrorState />
                )}
                {isLG && (isLoadingWH ? (
                    <Skeleton variant="rectangular" height={150} />
                ) : (
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            gap={1}
                        >
                            {dataWH && dataWH.map((wh) => (
                                <Button
                                    key={wh.id}
                                    color="info"
                                    variant={selectedWarehouse?.id === wh.id ? "contained" : "outlined"}
                                    onClick={() => {
                                        setSelectedWarehouse(wh);
                                        const warehouseWithTotal = dataWHWithTotal?.find(
                                            whWithTotal => whWithTotal.id === wh.id
                                        );
                                        setSelectedWarehouseWithTotal(warehouseWithTotal);

                                        const newIndex = dataWH.findIndex(w => w.id === wh.id);
                                        setCurrentWarehouseIndex(newIndex);
                                        setPage(0);
                                    }}
                                >
                                    {wh.location ? wh.location.split(",")[0].trim() : "未設定"}
                                </Button>
                            )
                            )}
                        </Stack>
                        <Stack
                            direction="row"
                            gap={2}
                        >
                            <Tooltip title="戻">
                                <IconButton onClick={handleBackWarehouse} aria-label="戻">
                                    <ArrowBackIosIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="次">
                                <IconButton onClick={handleNextWarehouse} aria-label="次">
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="登録">
                                <IconButton aria-label="登録" onClick={() => {
                                    setOpenCreateWarehouseForm(true)
                                }}>
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                ))}
                {isLoadingWHWithTotal ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Box>
                        <Box
                            sx={{
                                px: 2,
                                py: 1,
                            }}
                        >
                            <Typography variant="h6">{selectedWarehouse?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                住所: {selectedWarehouse?.location}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} mt={1}>
                                <Chip
                                    label={statusInfo.label}
                                    color={statusInfo.color}
                                    size="small"
                                />
                                <Tooltip title="削除">
                                    <IconButton
                                        aria-label="delete"
                                        size="small"
                                        sx={{
                                            '&:hover': {
                                                color: "red",
                                            },
                                        }}
                                        onClick={() => {
                                            handleDelete()
                                        }}
                                    >
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="編集">
                                    <IconButton
                                        aria-label="edit"
                                        size="small"
                                        sx={{
                                            '&:hover': {
                                                color: "orange",
                                            },
                                        }}
                                        onClick={() => {
                                            setOpenEditWarehouseForm(true)
                                        }}
                                    >
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                        <Box mt={1} display="flex" flexDirection={{ xs: 'column', xl: 'row' }} gap={4} >
                            <TableContainer component={Paper} sx={{ height: "100%", xs: 308, lg: 600 }}>
                                <Table
                                    sx={{
                                        backgroundColor: colors.primary[400],
                                        tableLayout: "fixed",
                                        '& .MuiTableCell-root': {
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        },
                                    }}>
                                    <colgroup>
                                        <col style={{ width: "40%" }} />
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "15%" }} />
                                    </colgroup>
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                fontWeight: "bold",
                                                backgroundColor: colors.blueAccent[700],
                                                color: colors.grey[100]
                                            }}
                                        >
                                            <TableCell sortDirection={orderBy === 'productName' ? order : false}>
                                                <TableSortLabel
                                                    active={orderBy === 'productName'}
                                                    direction={orderBy === 'productName' ? order : 'asc'}
                                                    onClick={() => {
                                                        const isAsc = orderBy === 'productName' && order === 'asc';
                                                        setOrder(isAsc ? 'desc' : 'asc');
                                                        setOrderBy('productName');
                                                    }}
                                                >
                                                    商品名
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sortDirection={orderBy === 'sku' ? order : false}>
                                                <TableSortLabel
                                                    active={orderBy === 'sku'}
                                                    direction={orderBy === 'sku' ? order : 'asc'}
                                                    onClick={() => {
                                                        const isAsc = orderBy === 'sku' && order === 'asc';
                                                        setOrder(isAsc ? 'desc' : 'asc');
                                                        setOrderBy('sku');
                                                    }}
                                                >
                                                    SKU
                                                </TableSortLabel></TableCell>
                                            <TableCell sortDirection={orderBy === 'quantity' ? order : false}>
                                                <TableSortLabel
                                                    active={orderBy === 'quantity'}
                                                    direction={orderBy === 'quantity' ? order : 'asc'}
                                                    onClick={() => {
                                                        const isAsc = orderBy === 'quantity' && order === 'asc';
                                                        setOrder(isAsc ? 'desc' : 'asc');
                                                        setOrderBy('quantity');
                                                    }}
                                                >
                                                    在庫数
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sortDirection={orderBy === 'reservedQuantity' ? order : false}>
                                                <TableSortLabel
                                                    active={orderBy === 'reservedQuantity'}
                                                    direction={orderBy === 'reservedQuantity' ? order : 'asc'}
                                                    onClick={() => {
                                                        const isAsc = orderBy === 'reservedQuantity' && order === 'asc';
                                                        setOrder(isAsc ? 'desc' : 'asc');
                                                        setOrderBy('reservedQuantity');
                                                    }}
                                                >
                                                    予約数
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={orderBy === 'available'}
                                                    direction={orderBy === 'available' ? order : 'asc'}
                                                    onClick={() => {
                                                        const isAsc = orderBy === 'available' && order === 'asc';
                                                        setOrder(isAsc ? 'desc' : 'asc');
                                                        setOrderBy('available');
                                                    }}
                                                >
                                                    出荷可能数
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedFilteredData
                                            .slice(
                                                page * rowsPerPage,
                                                rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : stocks.length
                                            )
                                            .map((row) => (
                                                <TableRow key={row.id} >
                                                    <TableCell>{row.productName}</TableCell>
                                                    <TableCell>{row.sku}</TableCell>
                                                    <TableCell>{row.quantity}</TableCell>
                                                    <TableCell>{row.reservedQuantity}</TableCell>
                                                    <TableCell>{row.quantity - row.reservedQuantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        {/** 空行の埋め合わせ */}
                                        {emptyRows > 0 && (
                                            <TableRow
                                                style={{
                                                    height: emptyRows * 50.16,
                                                }}
                                            >
                                                <TableCell colSpan={5} />
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10,]}
                                                colSpan={5}
                                                count={stocks.length}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                slotProps={getCommonSlotProps(isSM)}
                                                onPageChange={handleChangePage}
                                                onRowsPerPageChange={handleChangeRowsPerPage}
                                                ActionsComponent={TablePaginationActions}

                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>

                            <Box
                                display='flex'
                                gap={4}
                                flexDirection={{ xl: 'column', sm: 'row', xs: 'column' }}
                                justifyContent="space-between"
                            >
                                <Box
                                    display='flex'
                                    gap={2}
                                    flexDirection={{ xl: 'column', lg: 'row', xs: 'column' }}
                                >
                                    <Stack direction="row" gap={2} justifyContent="space-between">
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
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
                                                        justifyContent: "space-between"
                                                    }}
                                                >
                                                    <Stack direction="row" gap={2} justifyContent="space-between">
                                                        <WidgetsIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1}>
                                                            <Battery20Icon sx={{ alignSelf: "center" }} color="warning" />
                                                            <Typography variant="subtitle2" color="info" sx={{ fontWeight: 'bold' }}>
                                                                {Math.round(percentQty * 100) / 100}%
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Typography
                                                        component="div"
                                                        sx={{
                                                            fontSize: {
                                                                xl: '2rem',
                                                                xs: '3rem'
                                                            },
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {totalQuantity}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        在庫合計
                                                    </Typography>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
                                            }}
                                        >
                                            <Box
                                                minWidth={140}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                                flexGrow={1}>
                                                <CardContent
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        flex: 1,
                                                        justifyContent: "space-between"
                                                    }}
                                                >

                                                    <Stack direction="row" gap={2} justifyContent="space-between">
                                                        <PointOfSaleIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1} sx={{ visibility: "hidden" }}>
                                                            <MovingIcon sx={{ alignSelf: "center" }} color="success" />
                                                            <Typography variant="subtitle2" color="success" sx={{ fontWeight: 'bold' }}>
                                                                {Math.round(percentPO7d * 100) / 100}%
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Typography
                                                        component="div"
                                                        sx={{
                                                            fontSize: {
                                                                xl: '2rem',
                                                                xs: '3rem'
                                                            },
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {selectedWarehouse?.stocks
                                                            .map(stock => stock.reservedQuantity)
                                                            .reduce((sum, reserverdqty) => sum + reserverdqty, 0)}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        予約合計
                                                    </Typography>
                                                </CardContent>

                                            </Box>

                                        </Card>
                                    </Stack>
                                    <Stack direction="row" gap={2} justifyContent="space-between">
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
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
                                                        justifyContent: "space-between"
                                                    }}
                                                >
                                                    <Stack direction="row" gap={2} justifyContent="space-between">
                                                        <ArchiveIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1}>
                                                            <MovingIcon sx={{ alignSelf: "center" }} color="success" />
                                                            <Typography variant="subtitle2" color="success" sx={{ fontWeight: 'bold' }}>
                                                                {Math.round(percentPO7d * 100) / 100}%
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Typography
                                                        component="div"
                                                        sx={{
                                                            fontSize: {
                                                                xl: '2rem',
                                                                xs: '3rem'
                                                            },
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {totalReceivedPO}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        入荷合計
                                                    </Typography>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
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
                                                        justifyContent: "space-between"
                                                    }}
                                                >
                                                    <Stack direction="row" gap={2} justifyContent="space-between">
                                                        <UnarchiveIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1}>
                                                            <TrendingDownIcon sx={{ alignSelf: "center" }} color="error" />
                                                            <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold' }}>
                                                                {Math.round(percentSO7d * 100) / 100}%
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Typography
                                                        component="div"
                                                        sx={{
                                                            fontSize: {
                                                                xl: '2rem',
                                                                xs: '3rem'
                                                            },
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {totalDeliveredSo}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        出荷合計
                                                    </Typography>
                                                </CardContent>

                                            </Box>

                                        </Card>
                                    </Stack>
                                </Box>

                                <Box display="flex">
                                    <PieChart
                                        series={[
                                            {
                                                data: selectedWarehouse?.stocks?.map(stock => ({
                                                    id: stock.productId,
                                                    value: stock.quantity,
                                                    label: stock.productName
                                                })) || []
                                            }
                                        ]}
                                        width={200}
                                        height={200}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {openCreateWarehouseForm && (
                    <WarehouseForm
                        open
                        onClose={() => setOpenCreateWarehouseForm(false)}
                        onSubmit={(data) => {
                            createMutation.mutate(data)
                        }}
                    />
                )}

                {openEditWarehouseForm && selectedWarehouse && (
                    <WarehouseForm
                        open
                        warehouse={selectedWarehouse}
                        onClose={() => setOpenEditWarehouseForm(false)}
                        onSubmit={(formData) => {
                            if (selectedWarehouse?.id) {
                                updateMutation.mutate({
                                    id: selectedWarehouse.id,
                                    data: formData
                                });
                            }
                        }}
                    />
                )}
            </Box>
        </Box >
    )
}

export default WarehousePage