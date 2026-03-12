import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import Header from "../../../shared/components/layout/Header";
import type { SupplierData, SupplierProductFormType } from "../types/supplier";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useSupplierProductsWithStock } from "../hooks/useSupplierProductsWithStock";
import SupplierDetailCard from "./SupplierDetailCard";
import { useEffect, useState } from "react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SupplierForm from "./SupplierForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierAPI } from "../api/supplierAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { usePurchasesOrderBySupplier } from "../../purchases/hooks/usePurchasesOrderBySupplier";
import SupplierStatCard from "./SupplierStatCard";
import OrderBySupplierTable from "./OrderBySupplierTable";
import SupplierCategoryTable from "./SupplierCategoryTable";
import AddIcon from '@mui/icons-material/Add';
import { useScreen } from "../../../shared/hooks/ScreenContext";
import { styledSelect } from "../../../shared/components/global/select/styledSelect";
import { tokens } from "../../../shared/theme";
import SupplierProductForm from "./SupplierProductForm";
import { useProducts } from "../../products/hooks/useProducts";
import type { ProductData } from "../../products/types/product";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../../shared/hooks/dialogs/useDialogs";
import ProductForm from "../../products/components/ProductForm";
import { useAddProduct } from "../../products/hooks/useAddProduct";
import { useCategorySummaries } from "../../categories/hooks/useCategorySummaries";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCommonMenuProps } from "../../../shared/components/global/select/SelectHelper";

/** 
 * 仕入先ページコンポーネント
 * 
 * 仕入先の詳細情報、在庫商品、最近の発注などを表示します。仕入先の編集や削除、商品追加の操作が可能です。
 * カテゴリ別の商品リストや発注履歴も表示され、商品や仕入先情報を効率的に管理できます。
 * 
 * @param openEditSupplierForm - 仕入先情報を編集するためのフォームが開いているかどうかを制御する状態
 * @param openSupplierProductDialog - 商品追加のダイアログが開いているかどうかを制御する状態
 * @param allProducts - すべての商品データ（商品追加時に使用）
 * @param selectedCategoryId - 現在選択されているカテゴリのID
 * @param supplierId - 仕入先のID（URLパラメータから取得）
 * @param data - 仕入先の詳細情報および在庫商品データ
 * @param dataPO - 仕入先に関連する最近の発注データ
 * 
 * 仕入先の情報を表示し、カテゴリごとに商品リストを管理。編集、削除、商品追加などの操作を提供します。
 * 仕入先情報の更新、商品情報の追加などを行うためのフォームも提供します。
 */

const SupplierPage = () => {

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { supplierId } = useParams<{ supplierId: string }>();

    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const { confirmDelete } = useDialogs();
    const { isSM } = useScreen();
    const queryClient = useQueryClient();

    // ステート
    const [openEditSupplierForm, setOpenEditSupplierForm] = useState(false);
    const [openSupplierProductDialog, setOpenSupplierProductDialog] = useState(false);
    const [openAddProductForm, setOpenAddProductForm] = useState(false);
    const [allProducts, setAllproducts] = useState<ProductData[] | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null | "">(null);
    const [newProductId, setNewProductId] = useState<number | null>(null);
    const handleOpenAddProductForm = () => setOpenAddProductForm(true);

    // データを取得
    const { isLoading, error, data } = useSupplierProductsWithStock(Number(supplierId));
    const { isLoading: isLoadingPO, error: errorPO, data: dataPO = [] } = usePurchasesOrderBySupplier(Number(supplierId));
    const { data: dataAllProducts = [], refetch: refetchAllProducts } = useProducts({
        enabled: false,
        staleTime: 5 * 60 * 1000,
    });
    // カテゴリ一覧データの取得
    const { data: categorySumaries } = useCategorySummaries();

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

    // 商品追加Mutation
    const addProduct = useAddProduct(showSnackbar, {
        onSuccess: async (createdProduct) => {
            const res = await refetchAllProducts();
            setAllproducts(res.data ?? []);
            setNewProductId(createdProduct.data.id ?? null);
        }
    });

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
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        },
    });
    const updateMutation = useMutation({
        mutationFn: async (updateSupplier: SupplierData) => {
            const updatedRes = await supplierAPI.updateSupplier(updateSupplier, Number(supplierId));
            return updatedRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["supplier", Number(supplierId)] });

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => supplierAPI.deleteSupplier(Number(supplierId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["supplier"] });
            setTimeout(() => {
                navigate("/suppliers");
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleDelete = async () => {
        const ok = await confirmDelete(
            `仕入先「${data?.supplier.name}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate();
        }
    };

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
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header
                        title="仕入先情報"
                        subtitle="在庫と最近の発注を確認できます"
                    />

                )}
                {!isSM && <Box>
                    <Tooltip title="元に戻す">
                        <IconButton aria-label="元に戻す" color='info' onClick={() => {
                            navigate("/suppliers")
                        }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>}
            </Box>
            <Box minHeight="75vh">
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
                                    flexDirection={{ md: 'row' }}
                                >
                                    <SupplierDetailCard
                                        supplier={data?.supplier}
                                        openDeleteDialog={() => handleDelete()}
                                        openEditDialog={() => setOpenEditSupplierForm(true)}
                                    />
                                    {!isSM && <SupplierStatCard purchaseOrder={dataPO} />}
                                </Box>
                                {(!isSM && data.supplierProducts.length < 4) ? (
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
                                            <InputLabel id="select-category-label">カテゴリ</InputLabel>
                                            <Select
                                                labelId="select-category-label"
                                                id="select-category"
                                                value={selectedCategoryId || ""}
                                                label="カテゴリ"
                                                sx={styledSelect}
                                                MenuProps={getCommonMenuProps({
                                                    backgroundColor: colors.blueAccent[800],
                                                    color: colors.grey[100],
                                                })}
                                                onChange={(e) => {
                                                    const value = e.target.value;
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
                                    <Divider sx={{ mb: 1 }}>
                                        <Typography variant="h6">引き取り履歴</Typography>
                                    </Divider>
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
                                    openAddProductForm={handleOpenAddProductForm}
                                    newlyCreatedProductId={newProductId}
                                />
                            }
                            {/* 新規商品追加フォーム */}
                            {openAddProductForm && (
                                <ProductForm
                                    open
                                    onClose={() => setOpenAddProductForm(false)}
                                    onSubmit={(data) => {
                                        addProduct.mutate(data)
                                    }}
                                    categories={categorySumaries ?? []}
                                />
                            )}
                        </>
                    )
                )}
            </Box>
        </Box>
    )
}

export default SupplierPage;