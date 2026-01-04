import { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";
import { Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { SellData, SellDataRequest } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../hooks/useSnackbar";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import './Sell.css'
import { useProducts } from "../../hooks/useProducts";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import NumberField from "../../components/fields/NumberField";
import { useLocation } from "react-router-dom";

/**
 * yup を使ったフォームバリデーションスキーマ
 * - productId は必須
 * - quantity は 1〜100 の範囲
 * - description は最大 500文字
 * - note は最大 200文字
 */
const sellSchema = yup.object({
    productId: yup
        .number()
        .required("商品を選択してください")
        .typeError("商品を選択してください")
        .min(1, "商品を選択してください"),
    quantity: yup
        .number()
        .required("数量は必須です")
        .min(1, "数量は1以上で入力してください")
        .max(100, "数量は100以下で入力してください"),
    description: yup
        .string()
        .max(500, "詳細は500文字以内で入力してください")
        .required("詳細を入力してください"),
    note: yup
        .string()
        .max(200, "メモは200文字以内で入力してください")
        .required("メモを入力してください"),
});


const SellPage = () => {

    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック

    const location = useLocation();
    const selectedProductId = location.state?.productId;

    const [unitPrice, setUnitPrice] = useState(0); // 単価

    // 注文確認ダイアログ
    const [openConfirm, setOpenConfirm] = useState(false);
    const [tempSellData, setTempSellData] = useState<SellDataRequest | null>(null);
    const handleCloseConfirm = () => setOpenConfirm(false);
    const handleOpenDialog = (data: SellDataRequest) => {
        setTempSellData(data);
        setOpenConfirm(true);
    };

    // 商品データ取得用 useProductsフック
    const {
        data: productsData,
        isLoading: productsLoading,
        error: productsError } = useProducts();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors } } = useForm<SellDataRequest>({
            resolver: yupResolver(sellSchema),
            mode: "onBlur",
            defaultValues: {
                productId: 0,
                quantity: 1,
                description: "",
                note: "",
            }
        })

    // 販売用mutation
    const sellMutation = useMutation({
        mutationFn: async (data: SellData) => {
            const sellRes = await ApiService.sellProduct(data); // API呼び出し
            return sellRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || "販売完了", "success"); // スナックバー表示
            // フォームリセット

            setUnitPrice(0);
            queryClient.invalidateQueries({ queryKey: ['products'] }); // 商品データ再取得
        }, onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "販売に失敗しました。", "error");
        },
    })

    

    useEffect(() => {
        if (selectedProductId && productsData?.length) {
            const selectedProduct = productsData.find(p => p.id === selectedProductId);
            if (selectedProduct) {
                setValue("productId", selectedProductId);
                setUnitPrice(selectedProduct.price);
            }
        }
    }, [selectedProductId, productsData, setValue]);

    

    console.log(selectedProductId);
    console.log(location.state);
    return (
    
                <Container maxWidth="md" sx={{ py: 4 }}>
                    {/* メッセージ表示 */}
                    <CustomSnackbar
                        open={snackbar.open}
                        message={snackbar.message}
                        severity={snackbar.severity}
                        onClose={closeSnackbar}
                    />
                    <Typography
                        className="title"
                        variant="h4"
                        align="center"
                        fontWeight="bold"
                        sx={{ color: '#333', mb: 2 }}
                    >
                        販売
                    </Typography>

                    {/* ローディング表示 */}
                    {productsLoading && (
                        <Box textAlign="center" my={4}>
                            <CircularProgress />
                            <Typography>データを読み込み中...</Typography>
                        </Box>
                    )}

                    {/* エラー表示 */}
                    {productsError && (
                        <Box textAlign="center" my={4}>
                            <CircularProgress />
                            <Typography>商品データの取得に失敗しました。</Typography>
                        </Box>
                    )}
                    <form onSubmit={handleSubmit(handleOpenDialog)}>
                        <Grid className="purchase-form-page" container spacing={1}>
                            {/* 商品選択 */}
                            <Grid size={{ md: 12, xs: 12 }}>
                                <Typography>商品</Typography>
                                <FormControl
                                    fullWidth
                                    error={!!errors.productId}
                                    sx={{mt: 1}}
                                >
                                    <InputLabel id="select-required-product">選択してください</InputLabel>
                                    <Select
                                        labelId="select-required-product"
                                        id="select-required"
                                        {...register("productId")}
                                        value={watch("productId") || ""}
                                        label="選択してください *"
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const selectedProduct = productsData?.find(p => p.id == selectedId);
                                            setValue("productId", selectedId,);
                                            setUnitPrice(selectedProduct?.price || 0);
                                        }}
                                    >
                                        {productsData?.map((product) => (
                                            <MenuItem value={product.id}>{product.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {errors.productId &&
                                        <FormHelperText>{errors.productId.message}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            {/* 数量・単価・合計 */}
                            <Grid size={{ md: 12, xs: 12 }}>
                                <Stack
                                    spacing={{ xs: 1, sm: 2 }}
                                    direction="column"
                                >
                                    <Box >
                                        <Typography mb={1}>数量</Typography>
                                        <NumberField
                                            value={watch("quantity")}
                                            min={1}
                                            max={100}
                                            onValueChange={(value) =>
                                                setValue("quantity", Number(value))
                                            }
                                            error={!!errors.quantity}
                                        />
                                        {errors.quantity && (
                                            <FormHelperText>{errors.quantity.message}</FormHelperText>
                                        )}
                                    </Box>

                                    <Stack
                                        spacing={{ xs: 1, sm: 2 }}
                                        direction="row"
                                    >
                                        <div className="product-unitPrice">
                                            <label>単価: </label>
                                            <span>{unitPrice?.toLocaleString() || 0} 円</span>
                                        </div>
                                        <div className="product-totalPrice">
                                            <label>合計金額: </label>
                                            <span>{(watch("quantity") * (unitPrice || 0)).toLocaleString()} 円</span>
                                        </div>
                                    </Stack>
                                </Stack>
                            </Grid>
                            <Grid size={{ md: 12, xs: 12 }}>
                                <Stack
                                    spacing={{ xs: 1, sm: 2 }}
                                    direction="column"

                                >
                                    {/* 詳細入力 */}
                                    <TextField
                                        multiline
                                        label="詳細"
                                        rows={4}
                                        {...register("description")}
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />

                                    {/* メモ入力 */}
                                    <TextField
                                        multiline
                                        label="メモ"
                                        rows={2}
                                        {...register("note")}
                                        error={!!errors.note}
                                        helperText={errors.note?.message}
                                    />
                                </Stack>
                            </Grid>

                            {/* 送信ボタン */}
                            <Button type="submit" disabled={sellMutation.isPending} sx={{ mt: 1 }}>
                                {sellMutation.isPending ? "処理中..." : "販売を確定する"}
                            </Button>

                            {/* 確認ダイアログ */}
                            <Dialog
                                open={openConfirm}
                                onClose={handleCloseConfirm}
                                aria-labelledby="confirm-dialog-title"
                                aria-describedby="confirm-dialog-description"
                            >
                                <DialogTitle id="confirm-dialog-title">販売を確定しますか？</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="confirm-dialog-description">
                                        この内容で販売を確定してもよろしいですか？
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCloseConfirm} color="primary">キャンセル</Button>
                                    <Button
                                        onClick={() => {
                                            if (tempSellData) {
                                                sellMutation.mutate(tempSellData);
                                                reset();
                                                setOpenConfirm(false);
                                            }
                                        }}
                                        color="primary"
                                        autoFocus>確定</Button>
                                </DialogActions>
                            </Dialog>
                        </Grid>

                    </form>
                </Container >
  
    )
}

export default SellPage;