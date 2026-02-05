import { useParams } from "react-router-dom";
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Skeleton, Stack, Tooltip, useTheme, } from "@mui/material";
import Header from "../../../pages/Header";
import type { SupplierData, SupplierProductFormType } from "../types/supplier";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useSupplierProductsWithStock } from "../hooks/useSupplierProductsWithStock";
import SupplierDetailCard from "./SupplierDetailCard";
import { useEffect, useState } from "react";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SupplierForm from "./SupplierForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierAPI } from "../api/supplierAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import type { AxiosError } from "axios";
import { DeleteConfirmDialog } from "../../../shared/components/DeleteConfirmDialog";
import { usePurchasesOrderBySupplier } from "../../purchases/hooks/usePurchasesOrderBySupplier";
import SupplierStatCard from "./SupplierStatCard";
import OrderBySupplierTable from "./OrderBySupplierTable";
import SupplierCategoryTable from "./SupplierCategoryTable";
import AddIcon from '@mui/icons-material/Add';
import { useScreen } from "../../../shared/components/global/ScreenContext";
import { styledSelect } from "../../../shared/styles/styledSelect";
import { tokens } from "../../../shared/theme";
import SupplierProductForm from "./SupplierProductForm";
import { useProducts } from "../../products/hooks/useProducts";
import type { ProductData } from "../../products/types/product";


const SupplierPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { supplierId } = useParams<{ supplierId: string }>();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openEditSupplierForm, setOpenEditSupplierForm] = useState(false);
    const [openSupplierProductDialog, setOpenSupplierProductDialog] = useState(false);

    const { isSM } = useScreen();
    const queryClient = useQueryClient();
    const [allProducts, setAllproducts] = useState<ProductData[] | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null | "">(null);

    const { isLoading, error, data } = useSupplierProductsWithStock(Number(supplierId));
    const { isLoading: isLoadingPO, error: errorPO, data: dataPO = [] } = usePurchasesOrderBySupplier(Number(supplierId));
    const { data: dataAllProducts = [], refetch: refetchAllProducts } = useProducts({
        enabled: false,
        staleTime: 5 * 60 * 1000,
    });
    useEffect(() => {
        if ((data?.supplierProducts ?? []).length > 0 && selectedCategoryId === null) {
            setSelectedCategoryId(data?.supplierProducts[0].categoryId ?? null);
        }
    }, [data, selectedCategoryId]);

    const handleBackSupplier = () => {
        if (data?.supplierProducts && data.supplierProducts.length > 0) {
            const currentIndex = data.supplierProducts.findIndex(sp => sp.categoryId === selectedCategoryId);
            const prevIndex = (currentIndex - 1 + data.supplierProducts.length) % data.supplierProducts.length;
            setSelectedCategoryId(data.supplierProducts[prevIndex].categoryId ?? null);
        }
    }
    const handleNextSupplier = () => {
        if (data?.supplierProducts && data.supplierProducts.length > 0) {
            const currentIndex = data.supplierProducts.findIndex(sp => sp.categoryId === selectedCategoryId);
            const nextIndex = (currentIndex + 1) % data.supplierProducts.length;
            setSelectedCategoryId(data.supplierProducts[nextIndex].categoryId ?? null);
        }
    }

    const addMutation = useMutation({
        mutationFn: async (data: SupplierProductFormType) => {
            const addRes = await supplierAPI.addSupplierProduct(data, Number(supplierId));
            return addRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.CREATE_SUCCESS, "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["supplier", Number(supplierId)] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        },
    })
    const updateMutation = useMutation({
        mutationFn: async (updateProduct: SupplierData) => {
            const updatedRes = await supplierAPI.updateSupplier(updateProduct, Number(supplierId));
            return updatedRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["supplier", Number(supplierId)] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => supplierAPI.deleteSupplier(Number(supplierId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["supplier"] });
            setTimeout(() => {
                // navigate("/purchase-order");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleOpenCreate = async () => {
        let products: ProductData[] = dataAllProducts;
        if (!products.length) {
            const res = await refetchAllProducts();
            products = res.data ?? [];
        }
        setAllproducts(products);
        setOpenSupplierProductDialog(true);
    };
    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title="仕入先情報"
                    subtitle="在庫と最近の注文を確認できます"
                />
            )}
            <Box m={3} minHeight="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />
                {/* エラー表示 */}
                {(error || errorPO) && (
                    <ErrorState />
                )}

                {(isLoading) ? (
                    <Skeleton variant="rectangular" height={400} />

                ) : (
                    data && (
                        <>
                            <Box display="flex" justifyContent="space-between" flexDirection="column">
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    flexDirection={{ md: 'row', xs: 'column' }}
                                >
                                    <SupplierDetailCard
                                        supplier={data?.supplier}
                                        openDeleteDialog={() => setOpenDeleteConfirm(true)}
                                        openEditDialog={() => setOpenEditSupplierForm(true)}
                                    />

                                    <SupplierStatCard purchaseOrder={dataPO} />
                                </Box>
                                {!isSM ? (
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        mb={2}
                                    >
                                        <Stack
                                            direction="row"
                                            gap={1}
                                        >
                                            {data?.supplierProducts.map(sp => (
                                                <Button
                                                    key={sp.categoryId}
                                                    color="info"
                                                    variant={selectedCategoryId === sp.categoryId ? "contained" : "outlined"}
                                                    onClick={() => {
                                                        setSelectedCategoryId(sp.categoryId ?? null);
                                                    }}
                                                >
                                                    {sp.categoryName}
                                                </Button>
                                            ))}
                                        </Stack>
                                        <Stack
                                            direction="row"
                                        >
                                            <Tooltip title="戻">
                                                <IconButton onClick={handleBackSupplier} aria-label="戻">
                                                    <ArrowBackIosIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="次">
                                                <IconButton onClick={handleNextSupplier} aria-label="次">
                                                    <ArrowForwardIosIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="追加">
                                                <IconButton aria-label="追加" onClick={handleOpenCreate}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" justifyContent="space-between">

                                        <FormControl
                                            variant="standard"
                                            sx={{
                                                width: 180,
                                                mb: 2
                                            }}
                                        >
                                            <InputLabel id="select-category-label">カテゴリー</InputLabel>
                                            <Select
                                                labelId="select-category-label"
                                                id="select-category"
                                                value={selectedCategoryId}
                                                label="カテゴリー"
                                                sx={styledSelect}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            backgroundColor: colors.primary[600],
                                                            color: colors.grey[100],
                                                            minWidth: 200,
                                                            boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                                                        }
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value ? e.target.value : null;
                                                    setSelectedCategoryId(Number(value));
                                                }}
                                            >
                                                {data.supplierProducts.map(sp => (
                                                    <MenuItem key={sp.categoryId} value={sp.categoryId}>
                                                        {sp.categoryName}
                                                    </MenuItem>
                                                ))}

                                            </Select>
                                        </FormControl>
                                        <Tooltip title="追加">
                                            <IconButton aria-label="追加" onClick={handleOpenCreate}>
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                )}
                            </Box>
                            <Box mb={3}>
                                {data?.supplierProducts
                                    .filter(sp => sp.categoryId === selectedCategoryId)
                                    .map(cat => (
                                        <SupplierCategoryTable
                                            key={cat.categoryName}
                                            categoryName={cat.categoryName}
                                            products={cat.products}
                                            supplierId={Number(supplierId)}
                                            supplierStatus={data.supplier.supplierStatus}
                                            showSnackbar={showSnackbar}
                                        />
                                    ))}
                            </Box>
                            {(isLoadingPO) ? (
                                <Skeleton variant="rectangular" height={400} />
                            ) : (
                                <Box>
                                    <OrderBySupplierTable
                                        purchaseOrder={dataPO}
                                    />
                                </Box>
                            )}
                            {openEditSupplierForm &&
                                <SupplierForm
                                    open
                                    onClose={() => setOpenEditSupplierForm(false)}
                                    onSubmit={(data) => {
                                        updateMutation.mutate(data);
                                    }}
                                    supplier={data.supplier}
                                />
                            }
                            {openSupplierProductDialog &&
                                <SupplierProductForm
                                    open={openSupplierProductDialog}
                                    onClose={() => setOpenSupplierProductDialog(false)}
                                    onSubmit={(data) => {
                                        addMutation.mutate(data);
                                    }}
                                    products={allProducts ?? []}
                                />
                            }
                            <DeleteConfirmDialog
                                open={openDeleteConfirm}
                                onClose={() => setOpenDeleteConfirm(false)}
                                targetName={data.supplier.name}
                                onDelete={() => deleteMutation.mutate()}
                                isDeleting={deleteMutation.isPending}
                            />
                        </>
                    )
                )}
            </Box>
        </Box>
    )
}

export default SupplierPage;