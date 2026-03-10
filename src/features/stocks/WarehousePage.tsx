import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
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

import { PieChart } from '@mui/x-charts/PieChart';
import WarehouseForm from "./components/WarehouseForm";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { stockAPI } from "./api/stockAPI";
import { useWarehouses } from "./hooks/useWarehouses";
import { useWarehouseWithTotalQty } from "./hooks/useWarehouseWithTotalQty";
import { useScreen } from "../../shared/hooks/ScreenContext";

import { getErrorMessage } from "../../shared/utils/errorHandler";
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";
import { type Order } from "../products/AllProductsPage";
import { TablePaginationActions } from "../../shared/components/pagination/PaginationAction";
import { getCommonSlotProps } from "../../shared/components/pagination/TablePaginationHelper";
import { styledTable } from "../../shared/styles/StyleTable";
import { styledSelect } from "../../shared/components/global/select/styledSelect";
import WarehouseStats from "./components/WarehouseStats";
import WarehouseInfo from "./components/WarehouseInfo";
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';



type OrderBy = 'productName' | 'sku' | 'quantity' | 'reservedQuantity' | 'available'
const WarehousePage = () => {

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { showSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const { confirmDelete } = useDialogs();
    const { isSM, isXL } = useScreen();

    // ステート
    // ページネーションの状態管理
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 倉庫の作成・編集フォームの開閉状態
    const [openCreateWarehouseForm, setOpenCreateWarehouseForm] = useState(false);
    const [openEditWarehouseForm, setOpenEditWarehouseForm] = useState(false);
    const [openFilterDrawer, setOpenFilterDrawer] = useState(false);


    // 選択中の倉庫情報とその在庫データ
    const [selectedWarehouse, setselectedWarehouse] = useState<WarehousesData | undefined>(undefined);
    const [selectedWarehouseWithTotal, setselectedWarehouseWithTotal] = useState<WarehouseWithTotalChangedQtyData | undefined>(undefined);
    const [currentWarehouseIndex, setCurrentWarehouseIndex] = useState<number>(0);
    const [addedWarehouseIndex, setAddedWarehouseIndex] = useState<number | null>(null);
    const [tempWarehouseId, setTempWarehouseId] = useState<number | "">("");
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
                setselectedWarehouse(firstWarehouse);
                const firstWarehouseWithTotal = dataWHWithTotal?.find(
                    wh => wh.id === firstWarehouse.id
                );
                setselectedWarehouseWithTotal(firstWarehouseWithTotal);
                setTempWarehouseId(firstWarehouse.id)
            }
        }
    }, [dataWH, dataWHWithTotal, currentWarehouseIndex]);
    // 次の倉庫に移動
    const handleNextWarehouse = () => {
        if (dataWH && dataWH.length > 0) {
            const nextIndex = (currentWarehouseIndex + 1) % dataWH.length;
            setCurrentWarehouseIndex(nextIndex);
            const nextWarehouse = dataWH[nextIndex];
            setselectedWarehouse(nextWarehouse);

            const nextWarehouseWithTotal = dataWHWithTotal?.find(
                wh => wh.id === nextWarehouse.id
            );
            setselectedWarehouseWithTotal(nextWarehouseWithTotal);
        }
    };
    // 前の倉庫に移動
    const handleBackWarehouse = () => {
        if (dataWH && dataWH.length > 0) {
            const prevIndex = (currentWarehouseIndex - 1 + dataWH.length) % dataWH.length;
            setCurrentWarehouseIndex(prevIndex);
            const prevWarehouse = dataWH[prevIndex];
            setselectedWarehouse(prevWarehouse);

            const prevWarehouseWithTotal = dataWHWithTotal?.find(
                (wh) => wh.id === prevWarehouse.id
            );
            setselectedWarehouseWithTotal(prevWarehouseWithTotal);
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

    const pieData = Object.values(
        (selectedWarehouse?.stocks ?? []).reduce<Record<number, {
            id: number;
            value: number;
            label: string;
        }>>((acc, stock) => {
            if (!acc[stock.productId]) {
                acc[stock.productId] = {
                    id: stock.productId,
                    value: 0,
                    label: stock.productName
                };
            }
            acc[stock.productId].value += stock.quantity;
            return acc;
        }, {})
    );

    // フィルタDrawerを開く
    const handleOpenDrawer = () => {
        setOpenFilterDrawer(true);
    };
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
                {isLoadingWHWithTotal ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Box>
                        <Box
                            sx={{
                                py: 1,
                                flexDirection: {
                                    lg: "row",
                                    sm: "column",
                                    xs: "row"
                                }
                            }}
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Stack
                             gap={2}
                             flex={isSM ? 1 : ""}
                             >
                                <WarehouseInfo
                                    warehouse={selectedWarehouse}
                                    onDelete={handleDelete}
                                    onEdit={() => setOpenEditWarehouseForm(true)}
                                />
                                {isLoadingWH ? (
                                    <Skeleton variant="rectangular" height={150} />
                                ) : (!isXL ? (
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
                                                        setselectedWarehouse(wh);
                                                        const warehouseWithTotal = dataWHWithTotal?.find(
                                                            whWithTotal => whWithTotal.id === wh.id
                                                        );
                                                        setselectedWarehouseWithTotal(warehouseWithTotal);

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
                                ) : (
                                    <Box>
                                        {/* // 小画面はDrawer開閉ボタンのみ */}
                                        {isSM ? (<>
                                            <IconButton
                                                color="primary"
                                                onClick={handleOpenDrawer}
                                                aria-label="フィルター"
                                            >
                                                <FilterListIcon />
                                            </IconButton>
                                            <Drawer
                                                anchor="left"
                                                open={openFilterDrawer}
                                                onClose={() => setOpenFilterDrawer(false)}
                                                slotProps={{
                                                    paper: {
                                                        style: {
                                                            width: '80vw',
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
                                                    <FormControl sx={{ mt: 2 }}>
                                                        <InputLabel
                                                            id="warehouse-label"
                                                            sx={{
                                                                color: colors.grey[100],
                                                                '&.Mui-focused': {
                                                                    color: colors.grey[200],
                                                                },
                                                            }}
                                                        >
                                                            倉庫
                                                        </InputLabel>
                                                        <Select
                                                            labelId="warehouse-label"
                                                            id="warehouse"
                                                            value={tempWarehouseId}
                                                            onChange={(e) => {
                                                                setTempWarehouseId(Number(e.target.value));
                                                            }}
                                                            input={<OutlinedInput label="倉庫" />}
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

                                                            {dataWH?.map((wh) => (
                                                                <MenuItem key={wh.id} value={wh.id}>
                                                                    {wh.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    {/** Drawer フィルターの下部ボタン */}
                                                    <Box mt="auto" display="flex" justifyContent="right" gap={2} py={2}>
                                                        <Button variant="contained" color="warning" onClick={() => setOpenFilterDrawer(false)}>キャンセル</Button>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => {
                                                                const warehouse = dataWH?.find(
                                                                    w => w.id === tempWarehouseId
                                                                );

                                                                if (warehouse) {
                                                                    setselectedWarehouse(warehouse);
                                                                    const warehouseWithTotal = dataWHWithTotal?.find(
                                                                        w => w.id === warehouse.id
                                                                    );
                                                                    setselectedWarehouseWithTotal(warehouseWithTotal);
                                                                    const newIndex = dataWH?.findIndex(w => w.id === warehouse.id) ?? 0;
                                                                    setCurrentWarehouseIndex(newIndex);
                                                                    setPage(0);
                                                                }
                                                                setOpenFilterDrawer(false);
                                                            }}
                                                        >
                                                            適用
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Drawer>
                                        </>) : (
                                            <FormControl sx={{ m: 1, minWidth: 270 }}>
                                                <InputLabel
                                                    id="warehouse-label"
                                                    sx={{
                                                        color: colors.grey[100],
                                                        '&.Mui-focused': {
                                                            color: colors.grey[200],
                                                        },
                                                    }}
                                                >
                                                    倉庫
                                                </InputLabel>
                                                <Select
                                                    labelId="warehouse-label"
                                                    id="warehouse"
                                                    value={selectedWarehouse?.id ?? ""}
                                                    onChange={(e) => {
                                                        const id = Number(e.target.value);
                                                        const warehouse = dataWH?.find(w => w.id === id);
                                                        if (!warehouse) return;
                                                        setselectedWarehouse(warehouse);
                                                        const warehouseWithTotal = dataWHWithTotal?.find(
                                                            w => w.id === warehouse.id
                                                        );
                                                        setselectedWarehouseWithTotal(warehouseWithTotal);
                                                        const newIndex = dataWH?.findIndex(w => w.id === warehouse.id) ?? 0;
                                                        setCurrentWarehouseIndex(newIndex);
                                                        setPage(0);
                                                    }}
                                                    input={<OutlinedInput label="倉庫" />}
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

                                                    {dataWH?.map((wh) => (
                                                        <MenuItem key={wh.id} value={wh.id}>
                                                            {wh.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Box>
                                ))}
                            </Stack>

                            {(selectedWarehouse && selectedWarehouseWithTotal) && < WarehouseStats
                                selectedWarehouse={selectedWarehouse}
                                selectedWarehouseWithTotal={selectedWarehouseWithTotal}
                            />}

                        </Box>
                        <Box mt={1} display="flex" flexDirection={{ xs: 'column', xl: 'row' }} gap={4} >
                            <TableContainer component={Paper} sx={{ height: "100%", xs: 308, lg: 600 }}>
                                <Table
                                    sx={{
                                        ...styledTable(colors, {
                                            rowHoverBg: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                                        }),
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
                                        <TableRow>
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


                                <Box display="flex">
                                    <PieChart
                                        // series={[
                                        //     {
                                        //         data: selectedWarehouse?.stocks?.map(stock => ({
                                        //             id: stock.productId,
                                        //             value: stock.quantity,
                                        //             label: stock.productName
                                        //         })) || []
                                        //     }
                                        // ]}
                                        series={[
                                            {
                                                data: pieData
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