import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    useTheme
} from "@mui/material";
import Header from "../../../shared/components/layout/Header";
import { tokens } from "../../../shared/theme";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { productAPI } from "../api/productAPI";
import { useProductDetailAndCategories } from "../hooks/useProductDetailAndCategories";
import { styledTable } from "../../../shared/styles/StyleTable";
import ProductDetailCard from "./ProductDetailCard";
import ProductForm from "./ProductForm";
import StoreIcon from '@mui/icons-material/Store';
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SellIcon from '@mui/icons-material/Sell';
import { useWeeklySalesByProduct } from "../hooks/useWeeklySalesByProduct";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../../shared/hooks/dialogs/useDialogs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProductStat from "./ProductStat";


/**
 * 商品詳細カードコンポーネント
 *
 * 商品の基本情報、ステータス、カテゴリ、週間売上などを表示する
 * また、編集・削除の操作も可能
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Product} props.product - 表示する商品データ
 * @param {()  void} props.openEditDialog - 編集ダイアログを開くコールバック関数
 * @param {()  void} props.openDeleteDialog - 削除確認ダイアログを開くコールバック関数
 */

const ProductPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // 編集フォームの開閉状態を管理
    const [openEditProductForm, setOpenEditProductForm] = useState(false);

    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();
    const { confirmDelete } = useDialogs(); // 削除確認ダイアログ

    const { isSM } = useScreen();
    const { productId } = useParams<{ productId: string }>();

    // 商品詳細とカテゴリを取得するカスタムフック
    const { isLoading, error, data } = useProductDetailAndCategories(Number(productId));
    // 商品別週間売上データ取得
    const { data: WeeklySalesByProduct } = useWeeklySalesByProduct(Number(productId));
    const { productDetail, categories } = data ?? {};

    // 商品情報更新のMutation
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

    // 商品削除のMutation
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

    // 削除ボタン押下時の処理
    const handleDelete = async () => {
        const ok = await confirmDelete(
            `商品「${productDetail?.product.productName}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate(); // 削除実行
        }
    }
    // 仕入先数と平均価格計算
    const totalSuppliers = productDetail?.supplier.length || 0;
    const averagePrice = productDetail?.supplier && totalSuppliers > 0
        ? productDetail.supplier.reduce((sum, sp) => sum + (sp.price ?? 0), 0)
        / totalSuppliers
        : 0;

    const today = new Date();

    const year = today.getFullYear();
    const monthIndex = today.getMonth();

    const currentMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`; // YYYY-MM形式
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();  // 今月の日数
    const currentWeek = Math.ceil((today.getDate() * 4) / daysInMonth); // 4週間換算で今週番号

    let compareMonth = currentMonth;
    let compareWeek = currentWeek - 1;

    // 今週が第1週の場合、前月の第4週を比較対象にする
    if (currentWeek === 1) {
        const prevMonthDate = new Date(year, monthIndex - 1, 1);
        compareMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        compareWeek = 4;
    }

    // 今週と先週の売上データ取得
    const thisWeekData =
        WeeklySalesByProduct?.find(
            item => item.month === currentMonth && item.week === currentWeek
        ) ?? { weeklySales: 0, weeklyQty: 0 };

    const lastWeekData =
        WeeklySalesByProduct?.find(
            item => item.month === compareMonth && item.week === compareWeek
        ) ?? null;

    // 売上と数量の増減計算
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

    // 売上と数量の増減フラグ
    const isRevenueUp =
        lastWeekData ? thisWeekData.weeklySales > lastWeekData.weeklySales : null;

    const isQtyUp =
        lastWeekData ? thisWeekData.weeklyQty > lastWeekData.weeklyQty : null;

    // 円表示フォーマット
    const yenFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

    // 過去4週間の売上データ取得関数
    function getLast4WeeksData(productId: number, data: typeof WeeklySalesByProduct) {
        const productData = (data ?? []).filter(item => item.productId === productId);

        // 日付順にソート
        const sorted = productData.sort((a, b) => {
            const [aYear, aMonth] = a.month.split('-').map(Number);
            const [bYear, bMonth] = b.month.split('-').map(Number);

            if (aYear !== bYear) return aYear - bYear;
            if (aMonth !== bMonth) return aMonth - bMonth;
            return a.week - b.week;
        });

        const last4Weeks = sorted.slice(-4); // 最新4週間

        const chartData = last4Weeks.map(item => item.weeklySales); // チャート用データ

        const xAxisLabels = last4Weeks.map(item => {
            const month = new Date(item.month + "-01").toLocaleString('default', { month: 'short' });
            return `${month} 週${item.week}`;
        });

        return { chartData, xAxisLabels };
    }
    // チャート用データ取得
    const { chartData, xAxisLabels } = getLast4WeeksData(Number(productId), WeeklySalesByProduct);

    return (
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header
                        title="商品情報"
                    />
                )}
                <Box>
                    <Tooltip title="元に戻す">
                        <IconButton aria-label="元に戻す" color='info' onClick={() => {
                            navigate("/products");
                        }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box minHeight="90vh">
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {/* メイン表示 */}
                {(!isLoading && !error && data) ? (
                    <>
                        {/* 商品情報カード */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            sx={{
                                gap: { xs: 1, sm: 3 },
                                flexDirection: { xs: "column", sm: "row" }
                            }}
                        >
                            <ProductDetailCard
                                product={data.productDetail.product}
                                openDeleteDialog={() => handleDelete()}
                                openEditDialog={() => setOpenEditProductForm(true)}
                            />
                            {/** 上段カード群 */}
                           {!isSM && <Box
                                display='flex'
                                sx={{
                                    gap: { xs: 1, sm: 2 },
                                }}
                            >
                                <Stack
                                    sx={{
                                        display: "flex",
                                        flexDirection: { lg: "row" },
                                        justifyContent: { xs: "space-between", sm: "unset" }
                                    }}
                                    gap={2}
                                >
                                    {/** 取引先数カード */}
                                    <ProductStat
                                        icon={<StoreIcon sx={{ fontSize: { xs: 20, sm: 40 } }} />}
                                        title="取引先の数"
                                        value={productDetail?.supplier.length ?? 0}
                                    />
                                    {/** 平均仕入価格カード */}
                                    <ProductStat
                                        icon={<ShowChartIcon sx={{ fontSize: { xs: 20, sm: 40 } }} />}
                                        title="平均仕入価格"
                                        value={`¥${Intl.NumberFormat("ja-JP").format(averagePrice)}`}
                                    />
                                </Stack>

                                <Stack
                                    sx={{
                                        display: "flex",
                                        flexDirection: { lg: "row" },
                                        justifyContent: { xs: "space-between", sm: "unset" }
                                    }}
                                    gap={2}
                                >
                                    {/** 今週の売上カード */}
                                    <ProductStat
                                        icon={<RealEstateAgentIcon sx={{ fontSize: { xs: 20, sm: 40 } }} />}
                                        title="今週の売上"
                                        value={yenFormatter.format(thisWeekData.weeklySales)}
                                        changePercent={revenueChangePercent}
                                        isUp={isRevenueUp}
                                        tooltipValue={yenFormatter.format(thisWeekData.weeklySales)}
                                    />
                                    {/** 今週の取引数カード */}
                                    <ProductStat
                                        icon={<SellIcon sx={{ fontSize: { xs: 20, sm: 40 } }} />}
                                        title="今週の取引数"
                                        value={thisWeekData.weeklyQty}
                                        changePercent={qtyChangePercent}
                                        isUp={isQtyUp}
                                    />
                                </Stack>
                            </Box>}
                        </Box>
                        <Box
                            mt={1}
                            display="flex"
                            gap={4}
                            flexDirection="column"
                        >
                            <Box flex={2}>
                                {/** 仕入先テーブル */}
                                <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                                    <Table
                                        sx={{
                                            ...styledTable(colors, {
                                                rowHoverBg: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                                            }),
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
                                                /** 仕入先が存在しない場合の表示 */
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
                                                /** 仕入先データ表示 */
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
                                                                disabled={productDetail.product.status === "INACTIVE"}
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
                                {/** 在庫テーブル */}
                                <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                                    <Table
                                        sx={{
                                            ...styledTable(colors, {
                                                rowHoverBg: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                                            }),
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
                                                /** 在庫情報がない場合 */
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
                                                /** 在庫データ表示 */
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
                                {/** 在庫履歴テーブル */}
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
                                            ...styledTable(colors, {
                                                rowHoverBg: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                                            }),
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
                                                /** 履歴データがない場合 */
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
                                                /** 履歴データ表示 */
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

                                {/** 過去4週間売上チャート */}
                                <Box display="none">
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
                                        <Box flexGrow={1} >
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

                        {/* 編集フォーム表示 */}
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

                    </>
                ) : (<Skeleton variant="rectangular" height={400} />)}

            </Box>

        </Box>
    )
}

export default ProductPage;