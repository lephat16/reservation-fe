import { Avatar, Box, Chip, CircularProgress, styled, Typography, useTheme } from "@mui/material"
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar"
import Header from "../../layout/Header"
import { tokens } from "../../theme";
import { useSnackbar } from "../../hooks/useSnackbar";
import ApiService from "../../services/ApiService";
import type { StockHistoriesWithDetailData } from "../../types/warehouse";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { jaJP } from '@mui/x-data-grid/locales';


type StockHistoryType = {
    id: number,
    changeQty: number,
    refType: string,
    refId: number,
    notes: string,
    createdAt: string,
    warehouseName: string,
    productName: string,
    unit: string,
}

const QtyChip = styled(Chip)(({ theme }) => ({
    fontWeight: 900,
    fontSize: 14,
    paddingBottom: "4px",
    backgroundColor: "inherit",
    '&.SO': {
        color: (theme.vars || theme).palette.success.dark,
        border: `1px solid ${(theme.vars || theme).palette.success.main}`,
    },
    '&.PO': {
        color: (theme.vars || theme).palette.error.dark,
        border: `1px solid ${(theme.vars || theme).palette.error.main}`,
    },
}));


const StockHistoriesPage = () => {


    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const { isLoading, error, data } = useQuery<StockHistoriesWithDetailData[]>({
        queryKey: ['StockHistoriesWithDetails'],
        queryFn: async () => {
            const resCategories = await ApiService.getAllStockHistoriesWithDetails();
            console.log(resCategories);
            console.log(resCategories.data);
            return resCategories.data;
        }
    });

    const columns: GridColDef<StockHistoryType>[] = [

        {
            field: "refId",
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
                const color = type === "PO" ? "#f44336" : "#4caf50";

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
            field: "productName",
            headerName: "商品名",
            flex: 1
        },

        {
            field: "warehouseName",
            headerName: "倉庫",
            flex: 1,
        },
        {
            field: "changeQty",
            headerName: "変動数量",
            type: "number",
            flex: 0.4,
            renderCell: (params) => {
                const value = params.value as number;
                const refType = params.row.refType as string;

                if (typeof value !== "number") return value;

                const signedValue = refType === "PO" ? -value : value;

                const displayValue = signedValue > 0
                    ? `+${signedValue.toLocaleString() + params.row.unit}`
                    : signedValue.toLocaleString() + params.row.unit;

                return <QtyChip label={displayValue.toLocaleString()} className={refType} size="small" />;
            },
        },
        {
            field: "createdAt",
            headerName: "日付",
            flex: 0.6,
        },

        {
            field: "notes",
            headerName: "メモ",
            flex: 1,
        },


    ];
    const rows = data?.map(stock => ({
        id: stock.id,
        changeQty: stock.changeQty,
        refType: stock.refType,
        refId: stock.refId,
        notes: stock.notes,
        createdAt: stock.createdAt,
        productName: stock.productName,
        warehouseName: stock.warehouseName,
        unit: stock.unit,
    }))
    return (
        <Box m={3}>
            <Header
                title="在庫取引"
                subtitle="各取引の詳細情報を表示"
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

                <DataGrid
                    rows={rows}
                    columns={columns}
                    localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
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
            </Box>
        </Box>
    )
}

export default StockHistoriesPage