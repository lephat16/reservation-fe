import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme } from "@mui/material";
import Header from "../../../pages/Header";
import { tokens } from "../../../shared/theme";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { AxiosError } from "axios";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { productAPI } from "../api/productAPI";
import { useProductDetailAndCategories } from "../hooks/useProductDetailAndCategories";
import { styledTable } from "../../../shared/components/global/StyleTable";

export type ProductFormValues = {
    name: string;
    productCode: string;
    description?: string | null;
    unit?: string | null;
    status: string;
    categoryName: string;
}

type EditProductDialogProps = {
    open: boolean;
    onClose: () => void;
    product: ProductFormValues;
    categories: string[];
    onSave: (updatedProduct: FormData) => void;
    isSaving: boolean;
    hideFields?: string[];
}

export const EditProductDialog = ({
    open,
    onClose,
    product,
    categories,
    onSave,
    isSaving = false,
    hideFields
}: EditProductDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const schema = yup.object({
        name: yup.string().required("商品名は必須です"),
        productCode: yup.string().required("商品コードは必須です"),
        description: hideFields?.includes("description")
            ? yup.string().notRequired()
            : yup.string().required("説明は必須です"),
        unit: hideFields?.includes("unit")
            ? yup.string().notRequired()
            : yup.string().required("単位は必須です"),
        status: yup.string().required(),
        categoryName: yup.string().required("カテゴリを選択してください"),
    }).required();

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: product?.name || "",
            productCode: product?.productCode || "",
            status: product?.status,
            categoryName: product?.categoryName
        },
        resolver: yupResolver(schema),
        mode: "onBlur"
    });



    useEffect(() => {
        reset({ ...product });
    }, [product, reset]);


    const onSubmit = (data: ProductFormValues) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("productCode", data.productCode);
        formData.append("status", data.status);
        formData.append("categoryName", data.categoryName);
        if (data.description) formData.append("description", data.description);
        if (data.unit) formData.append("unit", data.unit);

        onSave(formData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.blueAccent[900],
                        borderRadius: 2,
                        p: 2,
                    }
                }
            }}
        >
            <DialogTitle>商品編集</DialogTitle>
            <DialogContent>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="商品名"
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    )}
                />
                <Controller
                    name="productCode"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="商品コード"
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.productCode}
                            helperText={errors.productCode?.message}
                        />
                    )}
                />
                {!hideFields?.includes("description") && (
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="説明"
                                fullWidth
                                margin="normal"
                                {...field}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                            />
                        )}
                    />)}
                {!hideFields?.includes("unit") && (
                    <Controller
                        name="unit"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="単位"
                                fullWidth
                                margin="normal" {...field}
                                error={!!errors.unit}
                                helperText={errors.unit?.message}
                            />
                        )}
                    />)}
                <Controller
                    name="categoryName"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="カテゴリ"
                            select
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.categoryName}
                            helperText={errors.categoryName?.message}
                        >
                            {categories.map((c, i) => (
                                <MenuItem key={i} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                    color="warning"
                >
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSaving}
                >
                    {isSaving ? "保存中..." : "保存"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    targetName?: string;
    onDelete: () => void;
    isDeleting: boolean;
}

export const DeleteConfirmDialog = ({
    open,
    onClose,
    title,
    targetName,
    onDelete,
    isDeleting

}: DeleteConfirmDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.blueAccent[900], borderRadius: 2, p: 2 } }
            }}
        >
            <DialogTitle>{title ? `${title}削除確認` : "商品削除確認"}</DialogTitle>
            <DialogContent>
                <Typography>
                    {targetName ? `${targetName}` : "この商品"} を本当に削除しますか？この操作は取り消せません。
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="inherit" onClick={onClose}>
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "削除中..." : "削除"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
const ProductPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [openEdit, setOpenEdit] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductFormValues | null>(null);

    const queryClient = useQueryClient();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();

    const { productId } = useParams<{ productId: string }>();

    const { isLoading, error, data } = useProductDetailAndCategories(Number(productId));
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
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        },

    });
    const deleteMutation = useMutation({
        mutationFn: async () => productAPI.deleteProduct(Number(productDetail?.product.id)),
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });
            setTimeout(() => {
                navigate("/products");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleEditClick = () => {

        if (productDetail?.product) {
            setSelectedProduct({
                productCode: productDetail.product.code,
                name: productDetail.product.productName,
                description: productDetail.product.description,
                unit: productDetail.product.unit,
                status: productDetail.product.status,
                categoryName: productDetail.product.categoryName,
            });

            setOpenEdit(true);
        }

    };

    return (
        <Box
            m={2}
            p={1}
            sx={{
                // backgroundColor: colors.primary[400],
                borderRadius: 1
            }}
        >
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                <Header
                    title="商品情報"
                    subtitle={productDetail?.product?.productName ?? "―"}
                />
            )}
            <Box m="40px 0 0 0" height="90vh">
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
                        <Card sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                            <CardContent>
                                <Typography variant="h6">基本情報</Typography>

                                <Grid container spacing={2} mt={1}>
                                    <Grid size={{ xs: 6, md: 8 }}>
                                        <Typography>商品コード: {productDetail?.product.code}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 8 }}>
                                        <Typography>カテゴリ: {productDetail?.product.categoryName}</Typography>
                                    </Grid>

                                    <Grid size={{ xs: 6, md: 8 }}>
                                        <Typography>商品説明: {productDetail?.product.description}</Typography>
                                    </Grid>

                                    <Grid size={{ xs: 6, md: 8 }}>
                                        <Typography>単位: {productDetail?.product.unit}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 8 }}>
                                        <Typography>在庫合計: {productDetail?.product.totalStock}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                            <Table
                                sx={{
                                    ...styledTable(theme.palette.mode),
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>仕入先</TableCell>
                                        <TableCell>SKU</TableCell>
                                        <TableCell>仕入単価</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {productDetail?.supplier.map(s => (
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
                                                >
                                                    発注
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={handleEditClick}
                            >編集</Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setOpenDeleteConfirm(true)}
                            >
                                削除
                            </Button>

                        </Stack>

                        <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
                            <Table
                                sx={{
                                    ...styledTable(theme.palette.mode),
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
                        <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400] }}>
                            <Table
                                sx={{
                                    ...styledTable(theme.palette.mode),
                                }}
                                size="small"
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

                        <EditProductDialog
                            open={openEdit}
                            onClose={() => setOpenEdit(false)}
                            product={selectedProduct!}
                            categories={categories?.map(c => c.name) ?? []}
                            onSave={(updated) => updateMutation.mutate(updated)}
                            isSaving={updateMutation.isPending}
                        />
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