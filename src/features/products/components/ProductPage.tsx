import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import Header from "../../../shared/components/layout/Header";
import { tokens } from "../../../shared/theme";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { productAPI } from "../api/productAPI";
import { useProductDetailAndCategories } from "../hooks/useProductDetailAndCategories";
import { styledTable } from "../../../shared/components/global/StyleTable";
import ProductDetailCard from "./ProductDetailCard";
import ProductForm from "./ProductForm";
import { DeleteConfirmDialog } from "../../../shared/components/DeleteConfirmDialog";
import StoreIcon from '@mui/icons-material/Store';
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SellIcon from '@mui/icons-material/Sell';
import MovingIcon from '@mui/icons-material/Moving';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useWeeklySalesByProduct } from "../hooks/useWeeklySalesByProduct";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import { getErrorMessage } from "../../../shared/utils/errorHandler";

const ProductPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openEditProductForm, setOpenEditProductForm] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();

    const { isSM } = useScreen();
    const { productId } = useParams<{ productId: string }>();

    const { isLoading, error, data } = useProductDetailAndCategories(Number(productId));
    const { data: WeeklySalesByProduct } = useWeeklySalesByProduct(Number(productId));
    const { productDetail, categories } = data ?? {};
    const updateMutation = useMutation({
        mutationFn: async (updateProduct: FormData) => {
            const updatedRes = await productAPI.updateProduct(updateProduct, Number(productId));
            return updatedRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["product-detail", Number(productId)] });

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        },

    });
    const deleteMutation = useMutation({
        mutationFn: async () => productAPI.deleteProduct(Number(productDetail?.product.id)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });
            setTimeout(() => {
                navigate("/products");
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });
    const totalSuppliers = productDetail?.supplier.length || 0;
    const averagePrice = productDetail?.supplier && totalSuppliers > 0
        ? productDetail.supplier.reduce((sum, sp) => sum + (sp.price ?? 0), 0)
        / totalSuppliers
        : 0;

    const today = new Date();

    const year = today.getFullYear();
    const monthIndex = today.getMonth();

    const currentMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const currentWeek = Math.ceil((today.getDate() * 4) / daysInMonth);

    let compareMonth = currentMonth;
    let compareWeek = currentWeek - 1;

    if (currentWeek === 1) {
        const prevMonthDate = new Date(year, monthIndex - 1, 1);
        compareMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        compareWeek = 4;
    }

    const thisWeekData =
        WeeklySalesByProduct?.find(
            item => item.month === currentMonth && item.week === currentWeek
        ) ?? { weeklySales: 0, weeklyQty: 0 };

    const lastWeekData =
        WeeklySalesByProduct?.find(
            item => item.month === compareMonth && item.week === compareWeek
        ) ?? null;

    const revenueChange =
        lastWeekData ? thisWeekData.weeklySales - lastWeekData.weeklySales : 0;

    const revenueChangePercent =
        lastWeekData && lastWeekData.weeklySales > 0
            ? (revenueChange / lastWeekData.weeklySales) * 100
            : null;

    const qtyChange =
        lastWeekData ? thisWeekData.weeklyQty - lastWeekData.weeklyQty : 0;

    const qtyChangePercent =
        lastWeekData && lastWeekData.weeklyQty > 0
            ? (qtyChange / lastWeekData.weeklyQty) * 100
            : null;

    const isRevenueUp =
        lastWeekData ? thisWeekData.weeklySales > lastWeekData.weeklySales : null;

    const isQtyUp =
        lastWeekData ? thisWeekData.weeklyQty > lastWeekData.weeklyQty : null;

    const yenFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

    function getLast4WeeksData(productId: number, data: typeof WeeklySalesByProduct) {
        const productData = (data ?? []).filter(item => item.productId === productId);

        const sorted = productData.sort((a, b) => {
            const [aYear, aMonth] = a.month.split('-').map(Number);
            const [bYear, bMonth] = b.month.split('-').map(Number);

            if (aYear !== bYear) return aYear - bYear;
            if (aMonth !== bMonth) return aMonth - bMonth;
            return a.week - b.week;
        });

        const last4Weeks = sorted.slice(-4);

        const chartData = last4Weeks.map(item => item.weeklySales);

        const xAxisLabels = last4Weeks.map(item => {
            const month = new Date(item.month + "-01").toLocaleString('default', { month: 'short' });
            return `${month} 週${item.week}`;
        });

        return { chartData, xAxisLabels };
    }
    const { chartData, xAxisLabels } = getLast4WeeksData(Number(productId), WeeklySalesByProduct);

    return (
        <Box
            m={2}
            p={1}
            sx={{
                borderRadius: 1
            }}
        >
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title="商品情報"
                    subtitle={productDetail?.product?.productName ?? "―"}
                />
            )}
            <Box m="40px 0 0 0" minHeight="90vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />
                {/* ローディング表示 */}


                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {/* メイン表示 */}
                {(!isLoading && !error && data) ? (
                    <>
                        <Box>
                            <ProductDetailCard
                                product={data.productDetail.product}
                                openDeleteDialog={() => setOpenDeleteConfirm(true)}
                                openEditDialog={() => setOpenEditProductForm(true)}
                            />
                        </Box>
                        <Box
                            mt={1}
                            display="flex"
                            flexDirection={{ xs: 'column', xl: 'row' }}
                            gap={4}
                        >
                            <Box flex={2}>
                                <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                                    <Table
                                        sx={{
                                            ...styledTable(colors),
                                            maxHeight: '15vh',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>仕入先</TableCell>
                                                <TableCell>SKU</TableCell>
                                                <TableCell>仕入単価</TableCell>
                                                {productDetail?.supplier.length === 0 || (<TableCell></TableCell>)}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {productDetail?.supplier.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        align="center"
                                                        sx={{ py: 3, color: colors.grey[100] }}
                                                    >
                                                        取引先の情報がありません
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                productDetail?.supplier.map(s => (
                                                    <TableRow key={s.supplierId}>
                                                        <TableCell>{s.supplierName}</TableCell>
                                                        <TableCell>{s.sku}</TableCell>
                                                        <TableCell>¥{s.price.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                size="small"
                                                                onClick={() => {
                                                                    navigate("/purchase-order/create", {
                                                                        state: {
                                                                            preselectedSupplierId: s.supplierId,
                                                                            preselectedSku: s.sku,
                                                                        }
                                                                    });
                                                                }}
                                                                disabled={productDetail.product.status === "INACTIVE" || productDetail.product.totalStock <= 0}
                                                            >
                                                                発注
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                                    <Table
                                        sx={{
                                            ...styledTable(colors),
                                            maxHeight: '15vh',
                                            overflowY: 'auto',
                                        }}
                                        size="small"
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>倉庫</TableCell>
                                                <TableCell>在庫数量</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {productDetail?.inventoryStock.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={2}
                                                        align="center"
                                                        sx={{ py: 3, color: colors.grey[100] }}
                                                    >
                                                        倉庫在庫情報がありません
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                productDetail?.inventoryStock.map((i, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{i.warehouseName}</TableCell>
                                                        <TableCell>{i.quantity}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        backgroundColor: colors.primary[400],
                                        maxHeight: '30vh',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <Table
                                        sx={{
                                            ...styledTable(colors),
                                        }}
                                        size="small"
                                        stickyHeader
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>日付</TableCell>
                                                <TableCell>入出庫区分</TableCell>
                                                <TableCell>数量</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {productDetail?.stockHistory.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        align="center"
                                                        sx={{
                                                            py: 3,
                                                            color: colors.grey[100],
                                                        }}
                                                    >
                                                        在庫履歴がありません
                                                    </TableCell>
                                                </TableRow>
                                            ) : (

                                                productDetail?.stockHistory.map((h, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{h.createdAt.slice(0, 10)}</TableCell>
                                                        <TableCell>{h.type}</TableCell>
                                                        <TableCell>{h.changeQty}</TableCell>
                                                    </TableRow>
                                                ))

                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

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
                                    <Stack flex={1} direction="row" gap={2} justifyContent="space-between">
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
                                                width: 220
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
                                                        <StoreIcon sx={{ fontSize: 40 }} />

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
                                                        {productDetail?.supplier.length}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        取引先の数
                                                    </Typography>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
                                                width: 220
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
                                                        <ShowChartIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1}>

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
                                                        ¥{Intl.NumberFormat('ja-JP').format(averagePrice)}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        平均仕入価格
                                                    </Typography>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                    </Stack>
                                    <Stack flex={1} direction="row" gap={2} justifyContent="space-between">
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
                                                width: 220
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
                                                        <RealEstateAgentIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1}>
                                                            {isRevenueUp === true && <MovingIcon color="success" fontSize="small" />}
                                                            {isRevenueUp === false && <TrendingDownIcon color="error" fontSize="small" />}
                                                            <Typography variant="body2">
                                                                {revenueChangePercent === null ? '—' : `${Math.abs(revenueChangePercent).toFixed(2)}%`}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Tooltip title={yenFormatter.format(thisWeekData.weeklySales)}>
                                                        <Typography
                                                            component="div"
                                                            sx={{
                                                                fontSize: {
                                                                    xl: '1rem',
                                                                    xs: '2rem',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                },
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            {yenFormatter.format(thisWeekData.weeklySales)}

                                                        </Typography>
                                                    </Tooltip>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        今週の売上
                                                    </Typography>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                        <Card
                                            sx={{
                                                backgroundColor: colors.primary[400],
                                                color: colors.grey[100],
                                                display: "flex",
                                                width: 220
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
                                                        <SellIcon sx={{ fontSize: 40 }} />
                                                        <Stack direction="column" gap={1}>
                                                            {isQtyUp === true && <MovingIcon color="success" fontSize="small" />}
                                                            {isQtyUp === false && <TrendingDownIcon color="error" fontSize="small" />}
                                                            <Typography variant="body2">
                                                                {qtyChangePercent === null ? '—' : `${Math.abs(qtyChangePercent).toFixed(2)}%`}
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
                                                        {thisWeekData.weeklyQty}
                                                    </Typography>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        今週の取引数
                                                    </Typography>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                    </Stack>

                                </Box>
                                <Box display="flex">
                                    <Stack
                                        width="100%"
                                        direction="row"
                                        sx={{
                                            ['@container (width < 600px)']: {
                                                flexWrap: 'wrap',
                                                maxWidth: '70%',
                                            },
                                        }}
                                        gap={2}
                                    >
                                        <Box flexGrow={1}>
                                            <SparkLineChart
                                                plotType="bar"
                                                data={chartData}
                                                height={100}
                                                showTooltip
                                                showHighlight
                                                xAxis={{
                                                    scaleType: 'band',
                                                    data: xAxisLabels,
                                                }}
                                            />
                                        </Box>

                                    </Stack>
                                </Box>
                            </Box>
                        </Box>


                        {openEditProductForm && (
                            <ProductForm
                                open
                                product={{
                                    name: productDetail?.product.productName ?? "",
                                    productCode: productDetail?.product.code ?? "",
                                    description: productDetail?.product.description ?? "",
                                    status: productDetail?.product.status ?? "INACTIVE",
                                    unit: productDetail?.product.unit ?? "",
                                    categoryName: productDetail?.product.categoryName ?? ""
                                }}
                                onClose={() => setOpenEditProductForm(false)}
                                onUpdate={(data) => {
                                    updateMutation.mutate(data);
                                }}
                                categories={categories ?? []}
                            />
                        )}
                        <DeleteConfirmDialog
                            open={openDeleteConfirm}
                            onClose={() => setOpenDeleteConfirm(false)}
                            targetName={productDetail?.product.productName}
                            onDelete={() => deleteMutation.mutate()}
                            isDeleting={deleteMutation.isPending}
                        />
                    </>
                ) : (<Skeleton variant="rectangular" height={400} />)}

            </Box>

        </Box>
    )
}

export default ProductPage;