import { Box, IconButton, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useTheme } from '@mui/material';
import { useState } from 'react'
import { tokens } from '../../../shared/theme';
import { useParams } from 'react-router-dom';
import { useSnackbar } from '../../../shared/hooks/useSnackbar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '../../../pages/Header';
import CustomSnackbar from '../../../shared/components/global/CustomSnackbar';
import { type GridColDef } from '@mui/x-data-grid';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CheckIcon from '@mui/icons-material/Check';
import { ReceiveFormDialog } from '../../purchases/components/ReceiveForm';
import { jaJP } from '@mui/x-data-grid/locales';
import type { AxiosError } from 'axios';
import ErrorState from '../../../shared/components/messages/ErrorState';
import { SNACKBAR_MESSAGES } from '../../../constants/message';
import type { WarehouseWithLocationData } from '../../products/types/product';
import type { DeliverStockItem } from '../../stocks/types/stock';
import { stockAPI } from '../../stocks/api/stockAPI';
import { useSaleOrderDetail } from '../hooks/useSaleOrderDetail';
import { useInventoryHistoryBySaleOrder } from '../../stocks/hooks/useInventoryHistoryBySaleOrder';
import { StyledDataGrid } from '../../../shared/components/global/StyledDataGrid';
import { useUser } from '../../../shared/hooks/UserContext';

const DeliverForm = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { soId } = useParams<{ soId: string }>();

    const { isStaff } = useUser();
    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック

    const [openDeliverForm, setOpenDeliverForm] = useState(false);
    const [selectedRemains, setSelectedRemains] = useState<number | null>(null);
    const [selectedSku, setSelectedSku] = useState<string | null>(null);

    const { isLoading: isLoadingSOD, error: errorSOD, data: dataSOD } = useSaleOrderDetail(Number(soId));
    const { isLoading: isLoadingStock, error: errorStock, data: dataStock } = useInventoryHistoryBySaleOrder(Number(soId));
    const { data: whData } = useQuery<WarehouseWithLocationData[]>({
        queryKey: ["selectedSku"],
        queryFn: async () => {
            if (!selectedSku) return [];
            const resWarehouse = await stockAPI.getAllWarehouseWithLocationBySku(selectedSku);
            return resWarehouse.data;
        },
        enabled: !!selectedSku
    });
    const deliverMutation = useMutation({
        mutationFn: async (data: { deliverItem: DeliverStockItem[], soId: number }) => {
            return stockAPI.deliverStock(data.deliverItem, data.soId);
        },
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.SELL.DELIVER_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["saleOrderDetail"] });

            setOpenDeliverForm(false);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.SELL.DELIVER_FAILED, "error");
        }
    });

    const [selectedProduct, setSelectedProduct] = useState<{
        productName: string;
        detailId: string;
    } | null>(null);


    // DataGrid行データ作成
    const rows = dataStock?.map((row, index) => ({
        id: index,
        detailId: row.id,
        productName: row.productName,
        warehouseName: row.warehouseName,
        changeQty: row.changeQty,
        notes: row.notes,
    })) ?? [];

    const columns: GridColDef<(typeof rows)[number]>[] = [
        { field: 'detailId', headerName: 'ID', flex: 1 },

        {
            field: 'productName',
            headerName: '商品名',
            flex: 2,
            editable: true,
        },
        {
            field: 'warehouseName',
            headerName: '倉庫',
            flex: 1.5,
            editable: true,
        },
        {
            field: 'changeQty',
            headerName: '受領数量',
            sortable: false,
            flex: 1.5,
        },
        {
            field: 'notes',
            headerName: '説明',
            flex: 2,
            editable: true,
        },
    ];
    return (
        <Box
            m={2}
            p={1}
            sx={{
                borderRadius: 1
            }}
        >
            {(isLoadingSOD) ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                < Header
                    title={`受注番号: ${dataSOD?.id ?? ""} | 顧客: ${dataSOD?.customerName ?? ""}`}
                    subtitle={`ステータス: ${dataSOD?.status ?? ""}`}
                />
            )}
            <Box mt={3} height="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />

                {/* エラー表示 */}
                {(errorSOD || errorStock) && (
                    <ErrorState />
                )}
                {(isLoadingSOD || isLoadingStock) ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    < TableContainer component={Paper} sx={{ m3: 3 }} >

                        <Table sx={{ backgroundColor: colors.primary[400], tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: colors.blueAccent[500],
                                        color: colors.grey[100]
                                    }}
                                >
                                    <TableCell></TableCell>
                                    <TableCell>商品名</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>売上数</TableCell>
                                    <TableCell>出荷数</TableCell>
                                    <TableCell>残出荷数</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataSOD?.details.map((detail, index) => {
                                    const remains = detail.qty - detail.deliveredQty;
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {remains === 0 ? (
                                                    <Tooltip title="商品はすでに受領済み">
                                                        <IconButton size="small" aria-label="受領済み">
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title={isStaff ? "管理者または倉庫管理者のみ出荷可能" : "出荷"}>
                                                        <span>
                                                            <IconButton aria-label="出荷"
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedProduct({
                                                                        productName: detail.productName,
                                                                        detailId: detail.id
                                                                    });
                                                                    setSelectedSku(detail.sku ?? null)
                                                                    setOpenDeliverForm(true);
                                                                    setSelectedRemains(remains);
                                                                }}
                                                            >
                                                                <WarehouseIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell>{detail.productName}</TableCell>
                                            <TableCell>{detail.sku}</TableCell>
                                            <TableCell>{detail.qty}</TableCell>
                                            <TableCell>{detail.deliveredQty}</TableCell>
                                            <TableCell>{remains}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {/* 在庫履歴タイトル */}
                <Typography
                    sx={{
                        mb: 3,
                        mt: 5,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 600,
                        color: colors.grey[200]
                    }}>
                    在庫履歴
                </Typography>
                {isLoadingStock ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <StyledDataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }}
                        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                        pageSizeOptions={[5]}
                        disableRowSelectionOnClick
                        autoHeight
                        mode={theme.palette.mode}
                    />
                )}
                {/* 受領フォームダイアログ */}
                {selectedProduct && (
                    <ReceiveFormDialog
                        open={openDeliverForm}
                        onClose={() => setOpenDeliverForm(false)}
                        onDeliver={(deliverItem) => {
                            if (soId) {
                                deliverMutation.mutate({ deliverItem, soId: Number(soId) });
                            } else {
                                console.error("");
                            }
                        }}
                        isPending={deliverMutation.isPending}
                        warehouses={whData || []}
                        product={selectedProduct}
                        remains={selectedRemains || 0}
                        poId={soId || ""}
                        supplier={dataSOD?.customerName || ""}
                        title="出荷"
                    />
                )}
            </Box >
        </Box >
    )
}

export default DeliverForm;