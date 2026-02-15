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
    Tooltip,
    Typography,
    useTheme
} from "@mui/material"
import Header from "../../pages/Header"
import { tokens } from "../../shared/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WarehouseFormData, WarehousesData, WarehouseWithTotalChangedQtyData } from "./types/stock";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import WidgetsIcon from '@mui/icons-material/Widgets';
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MovingIcon from '@mui/icons-material/Moving';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Battery20Icon from '@mui/icons-material/Battery20';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { PieChart } from '@mui/x-charts/PieChart';
import { DeleteConfirmDialog } from "../../shared/components/DeleteConfirmDialog";
import WarehouseForm from "./components/WarehouseForm";
import type { AxiosError } from "axios";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { stockAPI } from "./api/stockAPI";
import { useWarehouses } from "./hooks/useWarehouses";
import { useWarehouseWithTotalQty } from "./hooks/useWarehouseWithTotalQty";
import { useScreen } from "../../shared/hooks/ScreenContext";


interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number,
    ) => void;
}

export function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="最初"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="前"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="次"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="最後"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}


const WarehousePage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const { isSM } = useScreen();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [openCreateWarehouseForm, setOpenCreateWarehouseForm] = useState(false);
    const [openEditWarehouseForm, setOpenEditWarehouseForm] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehousesData | undefined>(undefined);
    const [selectedWarehouseWithTotal, setSelectedWarehouseWithTotal] = useState<WarehouseWithTotalChangedQtyData | undefined>(undefined);
    const [currentWarehouseIndex, setCurrentWarehouseIndex] = useState<number>(0);
    const [addedWarehouseIndex, setAddedWarehouseIndex] = useState<number | null>(null);

    const { isLoading: isLoadingWH, error: errorWH, data: dataWH } = useWarehouses();
    const { isLoading: isLoadingWHWithTotal, error: errorWHWithTotal, data: dataWHWithTotal } = useWarehouseWithTotalQty();

    const createMutation = useMutation({
        mutationFn: async (data: WarehouseFormData) => {
            const resAddedWarehouse = await stockAPI.createWarehouse(data);
            setAddedWarehouseIndex(resAddedWarehouse.data.id);

            return resAddedWarehouse;
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["WarehousesData"] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return stockAPI.deleteWarehouse(id);
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["WarehousesData"] });
            setOpenDeleteConfirm(false);
            setCurrentWarehouseIndex(0);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: WarehouseFormData }) => {
            return stockAPI.updateWarehouse(id, data);
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["WarehousesData"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        }
    });
    useEffect(() => {
        if (dataWH && addedWarehouseIndex) {
            const newIndex = dataWH.findIndex(w => w.id === addedWarehouseIndex);
            setCurrentWarehouseIndex(newIndex);
        }
    }, [addedWarehouseIndex, dataWH])
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

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, stocks.length - page * rowsPerPage);

    const totalQuantity = selectedWarehouse?.stocks
        .map(stock => stock.quantity)
        .reduce((sum, qty) => sum + qty, 0);

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

    return (
        <Box m={3}>
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
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />

                {/* エラー表示 */}
                {(errorWH || errorWHWithTotal) && (
                    <ErrorState />
                )}
                {isLoadingWH ? (
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
                )}
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
                                    label={selectedWarehouse?.status === "ACTIVE" ? "稼働中" : "停止中"}
                                    color={selectedWarehouse?.status === "ACTIVE" ? "success" : "error"}
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
                                            setOpenDeleteConfirm(true)
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
                            <TableContainer component={Paper} sx={{ height: "100%", minWidth: 650 }}>
                                <Table sx={{ backgroundColor: colors.primary[400], tableLayout: "fixed" }}>
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
                                            <TableCell>商品名</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>在庫数</TableCell>
                                            <TableCell>予約数</TableCell>
                                            <TableCell>出荷可能数</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stocks
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
                                        {emptyRows > 0 && Array.from(Array(emptyRows)).map((_, index) => (
                                            <TableRow key={`empty-${index}`} style={{ height: 53 }}>
                                                <TableCell colSpan={5} />
                                            </TableRow>
                                        ))}

                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10,]}
                                                colSpan={5}
                                                count={stocks.length}
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
                                flexDirection={{ xl: 'column', md: 'row' }}
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


                <DeleteConfirmDialog
                    open={openDeleteConfirm}
                    onClose={() => setOpenDeleteConfirm(false)}
                    targetName={selectedWarehouse?.name}
                    title="倉庫"
                    onDelete={() => {
                        if (selectedWarehouse?.id) {
                            deleteMutation.mutate(selectedWarehouse.id);
                        }
                    }}
                    isDeleting={deleteMutation.isPending}
                />
            </Box>
        </Box >
    )
}

export default WarehousePage