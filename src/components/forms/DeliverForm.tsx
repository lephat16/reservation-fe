import { Box, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react'
import { tokens } from '../../theme';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ApiService from '../../services/ApiService';
import Header from '../../layout/Header';
import CustomSnackbar from '../customSnackbar/CustomSnackbar';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CheckIcon from '@mui/icons-material/Check';
import { ReceiveFormDialog } from './ReceiveForm';
import type { DeliverStockItem, InventoryHistoryBySaleOrder, SaleOrderData, WarehouseWithLocationData } from '../../types';
import { jaJP } from '@mui/x-data-grid/locales';

const DeliverForm = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { soId } = useParams<{ soId: string }>();

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();

    const [openDeliverForm, setOpenDeliverForm] = useState(false);
    const [selectedRemains, setSelectedRemains] = useState<number | null>(null);
    const [selectedSku, setSelectedSku] = useState<string | null>(null);

    const { isLoading, error, data } = useQuery<{
        saleOrder: SaleOrderData;
        resInventoryHistoryBySaleOrder: InventoryHistoryBySaleOrder[];
    }>({
        queryKey: ['saleOrderDetail', soId],
        queryFn: async () => {
            const resSODetail = await ApiService.getSaleOrderById(Number(soId));
            const resInventoryHistoryBySaleOrder = await ApiService.getInventoryHistoryBySaleOrder(Number(soId));
            return {
                saleOrder: resSODetail.data,
                resInventoryHistoryBySaleOrder: resInventoryHistoryBySaleOrder.data,
            }
        },
        enabled: !!soId
    });

    const { data: whData } = useQuery<WarehouseWithLocationData[]>({
        queryKey: ['selectedSku'],
        queryFn: async () => {
            if (!selectedSku) return [];
            const resWarehouse = await ApiService.getAllWarehouseWithLocationBySku(selectedSku);
            return resWarehouse.data;
        },
        enabled: !!selectedSku
    });
    const deliverMutation = useMutation({
        mutationFn: async (data: { deliverItem: DeliverStockItem[], soId: number }) => {
            return ApiService.deliverStock(data.deliverItem, data.soId);
        },
        onSuccess: () => {
            showSnackbar("商品を注文しました。", "success");
            queryClient.invalidateQueries({ queryKey: ["saleOrderDetail"] });
            // setTimeout(() => {
            //     navigate(`/sell-order/${soId}/deliver`);
            // }, 500);
            setOpenDeliverForm(false);
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "注文に失敗しました", "error");
        }
    });

    const [selectedProduct, setSelectedProduct] = useState<{
        productName: string;
        detailId: string;
    } | null>(null);


    // DataGrid行データ作成
    const rows = data?.resInventoryHistoryBySaleOrder?.map((row, index) => ({
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
            <Header
                title={`受注番号: ${data?.saleOrder?.id ?? ""} | 顧客: ${data?.saleOrder?.customerName ?? ""}`}
                subtitle={`ステータス: ${data?.saleOrder?.status ?? ""}`}
            />
            <Box mt={3} height="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />
                {/* ローディング表示 */}
                {(isLoading) && (
                    <Box textAlign="center" my={4}>
                        <CircularProgress />
                        <Typography>データを読み込み中...</Typography>
                    </Box>
                )}
                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}
                <TableContainer component={Paper} sx={{ m3: 3 }} >

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
                            {data?.saleOrder.details.map((detail, index) => {
                                const remains = detail.qty - detail.deliveredQty;
                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {remains === 0 ? (
                                                <Tooltip title="商品はすでに受領済み">
                                                    <IconButton size="small">
                                                        <CheckIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="出荷">
                                                    <IconButton
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
                <DataGrid
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
                    sx={{
                        "--DataGrid-t-color-interactive-focus": "none !important",
                        "& .MuiDataGrid-root": {
                            border: "none",
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottom: "none",
                        },
                        "& .name-column--cell": {
                            color: colors.greenAccent[300],
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            color: colors.grey[100],
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: colors.primary[400],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "none",
                            backgroundColor: colors.greenAccent[700],
                        },
                        "& .MuiCheckbox-root": {
                            color: `${colors.greenAccent[400]} !important`,
                        },
                        "& .MuiDataGrid-toolbar": {
                            backgroundColor: colors.greenAccent[700],
                        },
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: colors.greenAccent[800],
                        },
                    }}
                />
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
                        supplier={data?.saleOrder.customerName || ""}
                        title="出荷"
                    />
                )}
            </Box >
        </Box >
    )
}

export default DeliverForm;