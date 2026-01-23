import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "../../theme";
import { useQuery } from "@tanstack/react-query";
import ApiService from "../../services/ApiService";
import { Box, Button, CircularProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme, type SxProps, type Theme } from "@mui/material";
import Header from "../../layout/Header";
import type { SupplierProductData } from "../../types/supplier";



type Props = {
    categoryName: string | undefined;
    products: SupplierProductData[];
    supplierId: number;
};

const supplierTableColumns = {
    product: {
        truncate: true,
    },
    sku: {},
    price: {
        align: "right" as const,
    },
    stock: {
        align: "center" as const,
    },
    action: {
        align: "center" as const,
    }
};


const cellStyle = (
    align?: "right" | "center",
    truncate?: boolean
): SxProps<Theme> => ({
    textAlign: align,
    whiteSpace: truncate ? "nowrap" : "normal",
    overflow: truncate ? "hidden" : "visible",
    textOverflow: truncate ? "ellipsis" : "clip",
});


const SupplierCategoryTable = ({ categoryName, products, supplierId }: Props) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const col = supplierTableColumns;
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

    return (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table
                sx={{
                    backgroundColor: colors.primary[400],
                    tableLayout: "fixed"
                }}
            >
                <colgroup>
                    <col style={{ width: isMobile ? "50%" : "30%" }} />
                    <col style={{ width: isMobile ? "25%" : "20%" }} />
                    {!isMobile && (
                        <>
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "15%" }} />
                        </>
                    )}
                    <col style={{ width: isMobile ? "25%" : "15%" }} />
                </colgroup>
                <TableHead >
                    <TableRow>
                        <TableCell
                            align="center"
                            colSpan={isMobile ? 3 : 5}
                            sx={{
                                fontWeight: "bold",
                                backgroundColor: colors.blueAccent[500],
                                fontSize: 16,
                                color: colors.grey[100]
                            }}>
                            {categoryName}
                        </TableCell>
                    </TableRow>
                    <TableRow
                        sx={{ backgroundColor: colors.primary[900] }}>
                        <TableCell
                            sx={cellStyle(undefined, col.product.truncate)}
                        >
                            商品名
                        </TableCell>
                        <TableCell>
                            SKU
                        </TableCell>
                        {!isMobile && (
                            <>
                                <TableCell sx={cellStyle(col.price.align)}>
                                    価格
                                </TableCell>
                                <TableCell sx={cellStyle(col.stock.align)}>
                                    在庫
                                </TableCell>
                            </>
                        )}
                        <TableCell sx={cellStyle(col.action.align)}>
                            操作
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((p) => (
                        <TableRow key={p.id} hover>
                            <TableCell sx={cellStyle(undefined, col.product.truncate)}>
                                {p.product}
                            </TableCell>
                            <TableCell>
                                {p.sku}
                            </TableCell>

                            {!isMobile && (
                                <>
                                    <TableCell sx={cellStyle(col.price.align)}>
                                        ¥{Number(p.price).toLocaleString()}
                                    </TableCell>

                                    <TableCell sx={cellStyle(col.stock.align)}>
                                        {p.stock}
                                    </TableCell>
                                </>
                            )}
                            <TableCell sx={cellStyle(col.action.align)}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() => {
                                        navigate("/purchase-order/create", {
                                            state: {
                                                preselectedSupplierId: supplierId,
                                                preselectedSku: p.sku,
                                            }
                                        });
                                    }}
                                >
                                    購入
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const SupplierPage = () => {


    const { supplierId } = useParams<{ supplierId: string }>();


    const { isLoading, error, data } = useQuery({
        queryKey: ['supplier', supplierId],
        enabled: !!supplierId,
        queryFn: async () => {
            const [resSupplierProducts, resSupplier] = await Promise.all([
                ApiService.getSupplierProductsWithStock(Number(supplierId)),
                ApiService.getSupplierById(Number(supplierId)),
            ]);
            return {
                supplierProducts: resSupplierProducts.data ?? [],
                supplier: resSupplier.data ?? null
            };
        }
    });



    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                <Header
                    title={`仕入先: ${data?.supplier.name ?? ""}`}
                    subtitle={` 住所: ${data?.supplier.address ?? ""}`}
                />
            )}
            <Box m={3} height="75vh">

                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    data?.supplierProducts.map(cat => (
                        <SupplierCategoryTable
                            key={cat.categoryName}
                            categoryName={cat.categoryName}
                            products={cat.products}
                            supplierId={Number(supplierId)}
                        />
                    ))
                )}

            </Box>
        </Box>
    )
}

export default SupplierPage;