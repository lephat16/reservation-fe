import React, { useState } from "react";
import ApiService from "../../services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionData, TransactionsResponse } from "../../types";
import { useSnackbar } from "../../hooks/useSnackbar";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import { Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import InfoIcon from '@mui/icons-material/Info';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import './Transaction.css'
import TransactionCard from "../../components/cards/TransactionCard";

const TransactionPage = () => {

    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar(); // スナックバー管理用カスタムフック

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    const {
        data: transactionsData,
        isLoading: transactionsLoading,
        error: transactionsError } = useQuery<TransactionData[]>({
            queryKey: ["transactions"],
            queryFn: async () => {
                const transactionsRes = await ApiService.getAllTransations();
                return transactionsRes.transactions || [];
            },
        });
    const statusCounts = transactionsData?.reduce((accumulator, transaction) => {
        accumulator[transaction.transactionStatus] = (accumulator[transaction.transactionStatus] || 0) + 1;
        return accumulator;
    }, {} as Record<string, number>) || {};

    const typeSums = transactionsData?.reduce((acc, tx) => {
        if (tx.transactionType === "SALE") acc.SALE = (acc.SALE || 0) + tx.totalProducts;
        if (tx.transactionType === "PURCHASE") acc.PURCHASE = (acc.PURCHASE || 0) + tx.totalProducts;
        return acc;
    }, {} as Record<string, number>) || {};
    const selectedTransaction = transactionsData?.find(tx => tx.id === selectedId);

    const updateMutation = useMutation<TransactionsResponse, Error, { id: number; description: string; note: string }>({
        mutationFn: async ({ id, description, note }: { id: number; description: string; note: string }) => {
            return await ApiService.updateTransaction(id, { description, note });
        },
        onSuccess: (response, variables) => {
            showSnackbar(response.message || "購入完了", "success"); // スナックバー表示
            queryClient.setQueryData<TransactionData[]>(['transactions'], old =>
                old?.map(tx =>
                    tx.id === variables.id ? { ...tx, description: variables.description, note: variables.note } : tx
                )
            );
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "変更に失敗しました。", "error")
        }
    });


    const columns: GridColDef<(typeof rows)[number]>[] = [
        { field: 'id', headerName: 'ID', width: 60 },
        {
            field: 'productName',
            headerName: '商品名',
            type: 'string',
            flex: 1,
        },
        {
            field: 'totalProducts',
            headerName: '商品数',
            type: 'number',
            flex: 1
        },
        {
            field: 'totalPrice',
            headerName: '合計金額',
            type: 'number',
            valueFormatter: (params: number) => `${params.toLocaleString('ja-JP')} 円`,
            width: 150,
            flex: 1,
        },
        {
            field: 'status',
            headerName: '状態',
            type: 'string',
            width: 110,
            flex: 1,
            renderCell: (params) => {
                let color: "default" | "primary" | "success" | "warning" | "error" = "default";
                let icon: React.ReactNode = undefined;
                switch (params.value) {
                    case 'COMPLETED':
                        color = 'success';
                        icon = <CheckCircleOutlineIcon fontSize="small" />;
                        break;
                    case 'PENDING':
                        color = 'warning';
                        icon = <HourglassBottomIcon fontSize="small" />;
                        break;
                    case 'CANCELED':
                        color = 'error';
                        icon = <CancelIcon fontSize="small" />;
                        break;
                    default:
                        color = 'default';
                }
                return (
                    <Tooltip title={params.value}>
                        <Chip label={params.value} color={color} icon={icon} size="small" />
                    </Tooltip>
                )
            }
        },
        {
            field: 'type',
            headerName: '種類',
            type: 'string',
            width: 160,
            flex: 1,
        },
        {
            field: 'actions',
            type: 'actions',
            width: 50,
            getActions: (params) => [
                <GridActionsCellItem
                    key="detail"
                    icon={
                        <Tooltip title="詳細">
                            <InfoIcon fontSize="small" />
                        </Tooltip>
                    }
                    label="Detail"
                    onClick={() => handleDetailClick(Number(params.id))}
                    showInMenu={false}
                />
            ],

        }
    ];

    const rows = transactionsData?.map((transData) => ({
        id: transData.id,
        productName: transData.productName,
        totalProducts: transData.totalProducts,
        totalPrice: transData.totalPrice,
        status: transData.transactionStatus,
        type: transData.transactionType
    })) ?? [];

    const handleDetailClick = (id: number) => {
        setSelectedId(id);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        
                <>
                    <CustomSnackbar
                        open={snackbar.open}
                        message={snackbar.message}
                        severity={snackbar.severity}
                        onClose={closeSnackbar}
                    />
                    {transactionsLoading && (
                        <div className="loading">
                            <CircularProgress />
                            <p>取引データを読み込み中...</p>
                        </div>
                    )}

                    {transactionsError && (
                        <p className="error">取引データの取得に失敗しました。</p>
                    )}

                    <Box sx={{ flex: 1, minHeight: 400, width: '100%' }}>
                        <Typography justifySelf="center" variant="h4" fontWeight="500">トランザクション</Typography>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent={"space-between"} my={3}>
                            <TableContainer component={Paper} sx={{ width: "300px" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" colSpan={3}>
                                                取引状況
                                            </TableCell>

                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ color: "darkgreen" }}>完了</TableCell>
                                            <TableCell sx={{ color: "orangered" }}>保留</TableCell>
                                            <TableCell sx={{ color: "red" }}>キャンセル</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow >
                                            <TableCell>{statusCounts.COMPLETED || 0}</TableCell>
                                            <TableCell>{statusCounts.PENDING || 0}</TableCell>
                                            <TableCell>{statusCounts.CANCELED || 0}</TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TableContainer component={Paper} sx={{ width: "300px" }}>
                                <Table size="small">
                                    <TableHead>

                                        <TableRow>
                                            <TableCell>販売</TableCell>
                                            <TableCell>購入</TableCell>
                                            <TableCell>残り</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>{typeSums.SALE?.toLocaleString('ja-JP') || 0} 個</TableCell>
                                            <TableCell>{typeSums.PURCHASE?.toLocaleString('ja-JP') || 0} 個</TableCell>
                                            <TableCell>{(typeSums.PURCHASE - typeSums.SALE).toLocaleString('ja-JP') || 0} 個</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Stack>
                        <DataGrid
                            loading={transactionsLoading}
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                            disableRowSelectionOnClick
                        />
                    </Box>

                    {selectedTransaction && (
                        <TransactionCard
                            data={selectedTransaction}
                            open={open}
                            onClose={handleClose}
                            onSave={(id, description, note) => {
                                updateMutation.mutate(
                                    { id, description, note },
                                    {
                                        onSuccess: () => {
                                            setOpen(false);
                                        }
                                    }
                                )
                            }}
                        />
                    )}

                </>
       
    )
}

export default TransactionPage;