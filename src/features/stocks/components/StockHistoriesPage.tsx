import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Skeleton, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material"
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import Header from "../../../pages/Header";
import { tokens } from "../../../shared/theme";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import type { StockHistoriesWithDetailData } from "../types/stock";
import { useQuery } from "@tanstack/react-query";
import { type GridColDef, type GridRowParams } from "@mui/x-data-grid";
import { jaJP } from '@mui/x-data-grid/locales';
import { useMemo, useState } from "react";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { stockAPI } from "../api/stockAPI";
import { StyledDataGrid } from "../../../shared/components/global/StyledDataGrid";

type StockHistoryItem = {
    stockId: number;
    productName: string;
    warehouseName: string;
    changeQty: number;
    unit: string;
    supplierSku: string;
    price: number;
    notes: string;
};
type StockHistoryGroupRow = {
    id: number; // refId
    refType: string;
    createdAt: string;
    participantName: string;
    userName: string;
    items: StockHistoryItem[];
};

const QtyChip = styled(Chip)(({ theme }) => ({
    fontWeight: 900,
    fontSize: 14,
    paddingBottom: "4px",
    backgroundColor: "inherit",
    '&.PO': {
        color: (theme.vars || theme).palette.success.dark,
        border: `1px solid ${(theme.vars || theme).palette.success.main}`,
    },
    '&.SO': {
        color: (theme.vars || theme).palette.error.dark,
        border: `1px solid ${(theme.vars || theme).palette.error.main}`,
    },
}));


const StockHistoriesPage = () => {


    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { snackbar, closeSnackbar } = useSnackbar();

    const [selectedRow, setSelectedRow] = useState<StockHistoryGroupRow | null>(null);
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };

    const { isLoading, error, data } = useQuery<StockHistoriesWithDetailData[]>({
        queryKey: ["stock-histories-with-details"],
        queryFn: async () => {
            const resCategories = await stockAPI.getAllStockHistoriesWithDetails();
            return resCategories.data;
        }
    });

    const columns: GridColDef<StockHistoryGroupRow>[] = [

        {
            field: "id",
            headerName: "注文 ID",
            flex: 0.3
        },

        {
            field: "refType",
            headerName: "タイプ",
            flex: 0.3,
            renderCell: (params) => {
                if (!params.value) return null;
                const type = params.value;
                const color = type === "SO" ? "#d32f2f" : "#388e3c";

                return (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Avatar
                            style={{
                                backgroundColor: color,
                                color: "#fff",
                                width: 30,
                                height: 30,
                            }}
                        >
                            {type}
                        </Avatar>
                    </div>
                );
            },

        },
        {
            field: "participantName",
            headerName: "取引先",
            flex: 1,
        },
        {
            field: "userName",
            headerName: "担当者",
            flex: 0.6,
        },

        {
            field: "createdAt",
            headerName: "作成日",
            flex: 0.6,
            valueGetter: (_, row) => {
                return new Date(row.createdAt).toLocaleString();
            }
        },
        {
            field: "items",
            headerName: "商品数",
            flex: 0.4,
            renderCell: (params) => params.value.length,
        },
        {
            field: "totalQty",
            headerName: "総数量",
            flex: 0.4,
            renderCell: (params) => {
                const value = params.row.items.reduce((sum, i) => sum + i.changeQty, 0);
                const refType = params.row.refType as string;

                if (typeof value !== "number") return value;

                const signedValue = refType === "SO" ? -value : value;

                const displayValue = signedValue > 0
                    ? `+${signedValue.toLocaleString() + params.row.items[0].unit}`
                    : signedValue.toLocaleString() + params.row.items[0].unit;

                return <QtyChip label={displayValue.toLocaleString()} className={refType} size="small" />;
            },
        },

    ];


    const rows: StockHistoryGroupRow[] = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const map = new Map<number, StockHistoryGroupRow>();
        data.forEach((stock, index) => {
            const rowId = stock.refId + index;
            if (!map.has(stock.refId)) {
                map.set(stock.refId, {
                    id: rowId,
                    refType: stock.refType,
                    createdAt: stock.createdAt,
                    participantName: stock.participantName,
                    userName: stock.userName,
                    items: [],
                });
            }
            map.get(stock.refId)!.items.push({
                stockId: stock.id,
                productName: stock.productName,
                warehouseName: stock.warehouseName,
                changeQty: stock.changeQty,
                unit: stock.unit,
                supplierSku: stock.supplierSku,
                price: stock.price,
                notes: stock.notes,
            });
        });
        return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [data]);
    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                <Header
                    title="在庫取引"
                    subtitle="各取引の詳細情報を表示"
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
                {(error) && (
                    <ErrorState/>
                )}

                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <StyledDataGrid
                        rows={rows}
                        columns={columns}
                        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                        onRowClick={(params: GridRowParams<StockHistoryGroupRow>) => {
                            setSelectedRow(params.row);
                            setOpen(true);
                        }}
                        
                    />
                )}
                <Dialog
                    open={open}
                    onClose={handleClose}
                    fullScreen={fullScreen}
                    fullWidth
                    maxWidth="lg"
                    aria-labelledby="responsive-dialog-title"
                    sx={{
                        "& .MuiDialog-paper": {
                            backgroundColor: colors.primary[900],
                        }
                    }}
                >
                    <DialogTitle
                        align="center"
                        color={colors.grey[100]}
                        fontSize={20}
                        fontWeight={600}
                    >
                        在庫取引詳細
                    </DialogTitle>
                    <DialogContent>

                        <DialogContentText>
                            {selectedRow && (
                                <TableContainer component={Paper}>
                                    <Table
                                        sx={{
                                            minWidth: 650,
                                            backgroundColor: colors.primary[400]
                                        }}
                                        aria-label="simple table">
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    fontWeight: "bold",
                                                    backgroundColor: colors.blueAccent[500],
                                                    color: colors.grey[100]
                                                }}
                                            >
                                                <TableCell>商品名</TableCell>
                                                <TableCell>SKU</TableCell>
                                                <TableCell>倉庫</TableCell>
                                                <TableCell>数量</TableCell>
                                                <TableCell>単価</TableCell>
                                                <TableCell>合計金額</TableCell>
                                                <TableCell>メモ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedRow.items.map((row) => (
                                                <TableRow
                                                    key={row.stockId}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">{row.productName}</TableCell>
                                                    <TableCell>{row.supplierSku}</TableCell>
                                                    <TableCell>{row.warehouseName}</TableCell>
                                                    <TableCell>{row.changeQty + row.unit}</TableCell>
                                                    <TableCell>{row.price}円</TableCell>
                                                    <TableCell>{row.price * row.changeQty}円</TableCell>
                                                    <TableCell>{row.notes}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            justifyContent: "center"
                        }}
                    >
                        <Button
                            variant="contained"
                            color="info"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    )
}

export default StockHistoriesPage