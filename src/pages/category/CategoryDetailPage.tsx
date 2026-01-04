import { Box, CircularProgress, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../layout/Header";
import ApiService from "../../services/ApiService";
import { useQuery } from "@tanstack/react-query";
import type { CategorySummaryData, ProductStockData } from "../../types";
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
            {/* ===== MAIN ROW ===== */}
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

            {/* ===== EXPAND ROW ===== */}
            <TableRow
                sx={{
                    backgroundColor: colors.primary[800],
                }}
            >
                <TableCell colSpan={4} sx={{ p: 0 }} >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box m={1} display="flex" gap={4}>

                            {/* ===== SUPPLIERS TABLE ===== */}

                            <Table
                                size="small"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Supplier</TableCell>
                                        <TableCell align="right">Price</TableCell>
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

                            {/* ===== STOCK TABLE ===== */}
                            {(product.stocks && product.stocks.length > 0) ? (
                                <>

                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Warehouse</TableCell>
                                                <TableCell align="right">Quantity</TableCell>
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

    const { isLoading, error, data } = useQuery<CategorySummaryData>({
        queryKey: ['categories'],
        queryFn: async () => {
            const resCategories = await ApiService.getCategorySummariesById(Number(categoryId));
            console.log(resCategories.data);
            return resCategories.data;
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
        <Box m="20px">
            <Header
                title={`カテゴリ: ${data?.categoryName ?? ""}`}
                subtitle={`サプライヤー: ${getAllSuppliers(data?.products)}`}
            />
            <Box m="40px 0 0 0" height="75vh">
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

                <TableContainer component={Paper}>
                    <Table
                        sx={{
                            backgroundColor: colors.primary[400]
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Product</TableCell>
                                <TableCell>Suppliers</TableCell>
                                <TableCell align="right">Total Stock</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {(data?.products || []).map(p => (
                                <ProductRow
                                    key={p.productName}
                                    product={p}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Box>
        </Box>
    )
}

export default CategoryDetailPage;