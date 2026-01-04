import { useState } from "react";
import ApiService from "../../services/ApiService";
import SupplierCard from "../../components/cards/SupplierCard";
import CustomPagination from "../../components/customPagination/CustomPagination";
import './Supplier.css'
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Container, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import FilterBar from "../../components/customFilterBar/CustomFilterBar";


const SupplierPage = () => {

    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;


    const { isLoading, error, data } = useQuery({
        queryKey: ["suppliers"],
        queryFn: async () => {
            return (await ApiService.getAllSuppliers()).suppliers;
        }
    })


    const filteredSupplier = (data ?? []).filter((supplier) => (
        (filterStatus === 'all' || supplier.supplierStatus.toLowerCase() === filterStatus) &&
        supplier.name.toLowerCase().includes(searchText.toLowerCase())
    ));

    const totalPages = Math.ceil(filteredSupplier.length / itemsPerPage)
    const displayedSuppliers = filteredSupplier?.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
      
                <Container maxWidth="lg" sx={{ py: 4, height: "100%" }}>
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            minHeight: '100vh',
                        }}
                    >
                        <Typography variant="h4" fontWeight="500">供給者一覧</Typography>
                        <FilterBar
                            searchText={searchText}
                            onSearchChange={setSearchText}
                        >
                            <FormControl variant="standard" sx={{ m: 1, minWidth: 180 }}>
                                <InputLabel id="select-standard-label">カテゴリー</InputLabel>
                                <Select
                                    labelId="select-standard-label"
                                    id="select-standard"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFilterStatus(value as 'all' | 'active' | 'inactive');
                                        setPage(1);
                                    }}
                                    label="sort"
                                >
                                    <MenuItem value="all">
                                        <em>全て</em>
                                    </MenuItem>
                                    <MenuItem value="active">有効</MenuItem>
                                    <MenuItem value="inactive">無効</MenuItem>
                                </Select>
                            </FormControl>
                        </FilterBar>

                        <Grid
                            container
                            sx={{
                                width: '100%',
                                padding: '30px',
                                flex: '1',
                            }}
                            spacing={{ xs: 2, md: 3 }} columns={{ xs: 8, sm: 4, md: 8 }}
                        >
                            {displayedSuppliers.map((supplier) => (
                                <Grid
                                    key={supplier.id}
                                    size={{ xs: 2, sm: 4, md: 4 }}
                                    sx={{ minWidth: '300px', maxWidth: '320px' }}
                                    gap={4}
                                >
                                    <SupplierCard
                                        key={supplier.id}
                                        name={supplier.name}
                                        contactInfo={supplier.contactInfo}
                                        address={supplier.address}
                                        status={supplier.supplierStatus}
                                    />
                                </Grid>
                            ))}
                            {displayedSuppliers.length === 0 && (<p>該当する商品はありません。</p>)}
                        </Grid>

                        {totalPages > 0 &&
                            <CustomPagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                            />
                        }
                    </Box>
                </Container>
     
    );
};

export default SupplierPage;
