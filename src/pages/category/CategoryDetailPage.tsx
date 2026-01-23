import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Collapse,
    Grid,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../layout/Header";
import ApiService from "../../services/ApiService";
import { useQuery } from "@tanstack/react-query";
import type { CategoryData, CategorySummaryData, ProductStockData } from "../../types";
import { useState } from "react";
import { useParams } from "react-router-dom";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';





interface ProductRowProps {
    product: ProductStockData;
}

function ProductRow({ product }: ProductRowProps) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);

    const totalStock =
        product.stocks?.reduce((sum, s) => sum + s.quantity, 0) ?? 0;

    return (
        <>
            {/* MAIN ROW */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell>{product.productName}</TableCell>

                <TableCell>
                    {product.suppliers.length} 件
                </TableCell>

                <TableCell align="right">{totalStock}</TableCell>
            </TableRow>

            {/* EXPAND ROW */}
            <TableRow
                sx={{
                    backgroundColor: colors.primary[800],
                }}
            >
                <TableCell colSpan={4} sx={{ p: 0 }} >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box m={1} display="flex" gap={4}>

                            {/* SUPPLIERS TABLE */}

                            <Table
                                size="small"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>仕入先名</TableCell>
                                        <TableCell align="right">仕入価格</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {product.suppliers.map(s => (
                                        <TableRow key={s.supplierName}>
                                            <TableCell>{s.supplierName}</TableCell>
                                            <TableCell align="right">
                                                ¥{s.price.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* STOCK TABLE */}
                            {(product.stocks && product.stocks.length > 0) ? (
                                <>

                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>倉庫</TableCell>
                                                <TableCell align="right">在庫数</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {product.stocks.map((st, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{st.warehouse}</TableCell>
                                                    <TableCell align="right">{st.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            ) : (
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                在庫なし
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}

                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
const CategoryDetailPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { categoryId } = useParams<{ categoryId: string }>();

    const [showMore, setShowMore] = useState(false);

    const { isLoading, error, data } = useQuery<{
        categorySummary: CategorySummaryData;
        categoryInfo: CategoryData;
    }>({
        queryKey: ['category'],
        queryFn: async () => {
            const resCategory = await ApiService.getCategorySummariesById(Number(categoryId));
            const resCategoryInfo = await ApiService.getCategoryById(Number(categoryId));
            return {
                categorySummary: resCategory.data,
                categoryInfo: resCategoryInfo.data,
            }
        }
    });

    const getAllSuppliers = (products?: ProductStockData[]): string => {
        if (!products || products.length === 0) return "";
        const suppliers = products.flatMap(p =>
            p.suppliers?.map(s => s.supplierName) ?? []
        );

        return Array.from(new Set(suppliers)).join(", ");
    };

    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                <Header
                    title={`カテゴリ: ${data?.categorySummary?.categoryName ?? ""}`}
                    subtitle={`仕入先: ${getAllSuppliers(data?.categorySummary?.products)}`}
                />
            )}
            <Box m="40px 0 0 0" minHeight="75vh">

                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}

                {data && (
                    <>
                        {isLoading ? (
                            <Skeleton variant="rectangular" height={250} sx={{ mb: 2 }} />
                        ) : (
                            <Card
                                sx={{
                                    display: 'flex',
                                    mb: 2,
                                    backgroundColor: colors.primary[400],
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1,
                                    }}>
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography
                                            component="div"
                                            variant="h5"
                                            sx={{ fontWeight: 'bold', mb: 1 }}
                                        >
                                            {data.categoryInfo.name}
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            component="div"
                                            sx={{
                                                color: data.categoryInfo.status === 'ACTIVE' ? 'success.main' : 'error.main',
                                                fontWeight: 'medium',
                                                mb: 1
                                            }}
                                        >
                                            {data.categoryInfo.status}
                                        </Typography>
                                        <Chip
                                            label={data.categoryInfo.status === "ACTIVE" ? "稼働中" : "停止中"}
                                            color={data.categoryInfo.status === "ACTIVE" ? "success" : "error"}
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                mb: 1,
                                                display: '-webkit-box',
                                                WebkitLineClamp: showMore ? 'none' : 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowMore(!showMore)}
                                        >
                                            {data.categoryInfo.description}
                                        </Typography>

                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            作成日: {data.categoryInfo.createdAt ? new Date(data.categoryInfo.createdAt).toLocaleDateString() : '-'}
                                        </Typography>

                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            更新日: {data.categoryInfo.updatedAt ? new Date(data.categoryInfo.updatedAt).toLocaleDateString() : '-'}
                                        </Typography>
                                    </CardContent>
                                </Box>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 180, objectFit: 'cover' }}
                                    image={data.categoryInfo.imageUrl}
                                    alt={data.categoryInfo.name}
                                />
                            </Card>
                        )}
                        {isLoading ? (
                            <Skeleton variant="rectangular" height={400} />
                        ) : (
                            <TableContainer component={Paper} sx={{ height: "100%" }}>
                                <Table
                                    stickyHeader
                                    sx={{
                                        backgroundColor: colors.primary[400]
                                    }}
                                >
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                "& .MuiTableCell-root": {
                                                    fontWeight: "bold",
                                                    backgroundColor: colors.blueAccent[800],
                                                    color: colors.grey[100],
                                                },

                                            }}
                                        >
                                            <TableCell />
                                            <TableCell>商品</TableCell>
                                            <TableCell>仕入先</TableCell>
                                            <TableCell align="right">在庫合計</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {(data?.categorySummary?.products && data.categorySummary.products.length > 0) ? (
                                            data.categorySummary.products.map(p => (
                                                <ProductRow
                                                    key={p.productName}
                                                    product={p}
                                                />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                    該当する商品がありません
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>

                )}


            </Box>
        </Box>
    )
}

export default CategoryDetailPage;