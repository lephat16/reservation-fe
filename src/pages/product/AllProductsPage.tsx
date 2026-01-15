import { useState } from "react";
import ProductCard from "../../components/cards/ProductCard";
import ApiService from "../../services/ApiService";
import './AllProduct.css'
import CustomPagination from "../../components/customPagination/CustomPagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import FilterBar from "../../components/customFilterBar/CustomFilterBar";
import Header from "../../layout/Header";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useNavigate } from "react-router-dom";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";

// ソートオプションの型
type SortOption = 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc' | 'none';

const AllProductPage = () => {

    // 商品リストとカテゴリリストの状態
    // フィルター用状態
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
    const [searchText, setSearchText] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>('none');

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const { isLoading, error, data } = useQuery({
        queryKey: ["products-and-categories"],
        queryFn: async () => {
            const productRes = await ApiService.getAllProducts();
            const categoryRes = await ApiService.getAllCategories();
            console.log(productRes)
            console.log(categoryRes)
            return {
                products: productRes.data ?? [],
                categories: categoryRes.data ?? []
            };
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ updateProduct, id }: { updateProduct: FormData; id: number }) => {
            const updatedRes = await ApiService.updateProduct(updateProduct, id);
            return updatedRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || "商品を編集しました", "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "販売に失敗しました。", "error");
        },

    });
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => ApiService.deleteProduct(id),
        onSuccess: () => {
            showSnackbar("商品を削除しました", "success");

            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });

        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "削除に失敗しました", "error");
        }
    });

    // カテゴリと検索文字列でフィルター
    const filteredProducts = (data?.products ?? []).filter(product =>
    ((selectedCategory === 'all' ||
        product.categoryName.trim().toLowerCase() === selectedCategory.trim().toLowerCase()) &&
        product.productName.toLowerCase().includes(searchText.toLowerCase())
    )
    );

    // ソート処理
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortOption) {
            case 'nameAsc':
                return a.productName.localeCompare(b.productName);
            case 'nameDesc':
                return b.productName.localeCompare(a.productName);
            default:
                return 0;
        }
    });

    // ページネーション計算
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const displayedProducts = sortedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);


    return (
        <Box m={3}>
            <Header
                title="商品一覧"
                subtitle="商品情報の一覧表示"
            />
            <Box 
            mt={3} 
            minHeight="90vh"
            height="auto"
            >
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
                <FilterBar
                    searchText={searchText}
                    onSearchChange={setSearchText}
                >
                    <Stack direction="row" mr={7}>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 180 }}>
                            <InputLabel id="select-standard-label">カテゴリー</InputLabel>
                            <Select
                                labelId="select-standard-label"
                                id="select-standard"
                                value={selectedCategory}
                                onChange={(e) => {
                                    // const value = e.target.value;
                                    // setSelectedCategory(value === 'all' ? 'all' : Number(value));
                                    setSelectedCategory(e.target.value);
                                }}
                                label="sort"
                            >
                                <MenuItem value="all">
                                    <em>すべてのカテゴリー</em>
                                </MenuItem>
                                {data?.categories?.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="select-standard-label">並び順</InputLabel>
                            <Select
                                labelId="select-standard-label"
                                id="select-standard"
                                value={sortOption}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSortOption(value === 'none' ? 'none' : value as SortOption);
                                }}
                                label="sort"
                            >
                                <MenuItem value="none">並び順なし</MenuItem>
                                <MenuItem value="nameAsc">名前: A→Z</MenuItem>
                                <MenuItem value="nameDesc">名前: Z→A</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </FilterBar>

                <Grid
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 8, md: 12, xl: 12 }}
                    mb={3}
                    minHeight="744px"
                >
                    {displayedProducts.map((p, i) => (
                        <Grid
                            key={i}
                            size={{ xs: 4, sm: 4, md: 4, xl: 3 }}
                        >
                            <ProductCard
                                id={p?.id ?? 0}
                                productName={p.productName}
                                code={p.code}
                                categoryName={p.categoryName}
                                totalStock={p.totalStock}
                                status={p.status}
                                supplier={p?.supplier || []}

                                description={p.description}
                                unit={p.unit}
                                categories={data?.categories?.map(c => c.name) ?? []}
                                onUpdate={(updated) =>
                                    updateMutation.mutate({
                                        updateProduct: updated,
                                        id: Number(p.id),
                                    })}
                                isUpdating={updateMutation.isPending}

                                onDelete={async (id) => {
                                    await deleteMutation.mutateAsync(id);
                                }}
                                isDeleting={deleteMutation.isPending}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* ページネーション */}
                {totalPages > 0 &&
                    <CustomPagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                    />
                }
            </Box>
        </Box>
    );
};

export default AllProductPage;
