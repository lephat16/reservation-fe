import { Box, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
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


const StockMovementHistoryPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const { isMD, isSM } = useScreen();

    const { isLoading, error, data } = useQuery<StockHistoriesWithDetailData[]>({
        queryKey: ["stock-histories-with-details"],
        queryFn: async () => {
            const resCategories = await stockAPI.getAllStockHistoriesWithDetails();
            return resCategories.data;
        }
    });
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
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <TableContainer component={Paper} sx={{ height: "100%", minWidth: { xs: 308, md: 600 } }}>
                        <Table
                            sx={{
                                tableLayout: "fixed",
                                ...styledTable(theme.palette.mode),
                            }}
                        >
                            <colgroup>
                                <col style={{ width: "12%" }} />
                                <col style={{ width: "6%" }} />
                                <col style={{ width: "7%" }} />
                                {!isMD && <col style={{ width: "7%" }} />}
                                <col style={{ width: "7%" }} />
                                <col style={{ width: "18%" }} />
                                {!isMD && <col style={{ width: "14%" }} />}
                                {!isMD && <col style={{ width: "10%" }} />}
                                {!isMD && <col style={{ width: "8%" }} />}
                                {!isMD && <col style={{ width: "10%" }} />}
                                <col style={{ width: "9%" }} />
                            </colgroup>

                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">日付</TableCell>
                                    <TableCell align="center">区分</TableCell>
                                    <TableCell align="right">数量</TableCell>
                                    {!isMD && (
                                        <TableCell align="right">変更前</TableCell>
                                    )}
                                    <TableCell align="right">変更後</TableCell>
                                    <TableCell>商品名</TableCell>
                                    {!isMD && (
                                        <TableCell>倉庫</TableCell>
                                    )}
                                    {!isMD && (
                                        <TableCell align="center">参照</TableCell>
                                    )}
                                    {!isMD && (
                                        <TableCell align="right">単価</TableCell>
                                    )}
                                    {!isMD && (
                                        <TableCell align="right">合計金額</TableCell>
                                    )}
                                    <TableCell align="center">担当者</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {data?.map((row) => {
                                    const qtyColor = row.type === "IN" ? "green" : "red";

                                    return (
                                        <TableRow key={row.id} hover>
                                            <TableCell align="center">
                                                {new Date(row.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.type === "IN" ? "入庫" : "出庫"}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: qtyColor, fontWeight: 600 }}>
                                                {row.signedQty}
                                            </TableCell>

                                            {!isMD && (
                                                <TableCell align="right">
                                                    {row.beforeQty}
                                                </TableCell>
                                            )}

                                            <TableCell align="right">
                                                {row.afterQty}
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200 }} title={row.productName}>
                                                {row.productName}
                                            </TableCell>
                                            {!isMD && (
                                                <TableCell>
                                                    {row.warehouseName}
                                                </TableCell>
                                            )}
                                            {!isMD && (
                                                <TableCell align="center">
                                                    {row.refType}-{row.refId}
                                                </TableCell>
                                            )}
                                            {!isMD && (
                                                <TableCell align="right">
                                                    {new Intl.NumberFormat("ja-JP", {
                                                        style: "currency",
                                                        currency: "JPY",
                                                    }).format(row.price ?? 0)}
                                                </TableCell>
                                            )}
                                            {!isMD && (
                                                <TableCell align="right">
                                                    ¥{(row.price * row.changeQty)?.toLocaleString()}
                                                </TableCell>
                                            )}
                                            <TableCell align="center">
                                                {row.userName}
                                            </TableCell>

                                        </TableRow>
                                    );
                                })}
                            </TableBody>

                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    )
}

export default StockMovementHistoryPage