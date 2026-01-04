import { useState } from "react";
import ProductCard from "../../components/cards/ProductCard";
import ApiService from "../../services/ApiService";
import './AllProduct.css'
import CustomPagination from "../../components/customPagination/CustomPagination";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Container, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import FilterBar from "../../components/customFilterBar/CustomFilterBar";
import Header from "../../layout/Header";

// ソートオプションの型
type SortOption = 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc' | 'none';

const AllProductPage = () => {

    // 商品リストとカテゴリリストの状態
    // フィルター用状態
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
    const [searchText, setSearchText] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>('none');

    const [page, setPage] = useState(1);
    const itemsPerPage = 4;

    const { isLoading, error, data } = useQuery({
        queryKey: ["products-and-categories"],
        queryFn: async () => {
            const productRes = await ApiService.getAllProducts();
            const categoryRes = await ApiService.getAllCategories();
            console.log(productRes)
            console.log(categoryRes)
            return {
                products: productRes.data,
                categories: categoryRes.data
            };
        }
    });



    return (
        <Box m="20px">
            <Header
                title="商品一覧"
                subtitle="商品情報の一覧表示"
            />
            <Box m="40px 0 0 0" height="90vh">
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

                <Grid container spacing={2}>
                    {data?.products.map((p, i) => (
                        <Grid key={i}>
                            <ProductCard
                                productName={p.productName}
                                code={p.code}
                                categoryName={p.categoryName}
                                totalStock={p.totalStock}
                                status={p.status}
                                supplier={p.supplier}
                            />
                        </Grid>
                    ))}
                </Grid>

            </Box>
        </Box>
    );
};

export default AllProductPage;
