import { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";
import { Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../hooks/useSnackbar";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import './Sell.css'
import { useProducts } from "../../hooks/useProducts";
import * as yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';

type Item = {
    productId: number;
    quantity: number;
    unitPrice: number;
}

type SellRequest = {
    description: string;
    note: string;
    items: Item[];
}

/**
 * yup を使ったフォームバリデーションスキーマ
 * - productId は必須
 * - quantity は 1〜100 の範囲
 * - description は最大 500文字
 * - note は最大 200文字
 */
const sellSchema = yup.object({
    description: yup
        .string()
        .max(500, "詳細は500文字以内で入力してください")
        .required("詳細を入力してください"),
    note: yup
        .string()
        .max(200, "メモは200文字以内で入力してください")
        .required("メモを入力してください"),
    items: yup.array().of(
        yup.object({
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
            unitPrice: yup
                .number()
                .required('単価は必須です')
                .min(1, '単価は1以上で入力してください')
        })
    ).required().min(1, "少なくとも1つの商品が必要です")

});


const SellPage = () => {

    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック

    // 商品データ取得用 useProductsフック
    const {
        data: productsData,
        isLoading: productsLoading,
        error: productsError } = useProducts();

    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<SellRequest>({
        resolver: yupResolver(sellSchema),
        mode: "onBlur",
        defaultValues: {
            description: "",
            note: "",
            items: [
                { productId: 0, quantity: 1, unitPrice: 1 }
            ]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // 販売用mutation
    const sellMutation = useMutation({
        mutationFn: async (data: SellRequest) => {
            const sellRes = await ApiService.sellProduct(data); // API呼び出し
            return sellRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || "販売完了", "success"); // スナックバー表示
            // フォームリセット
            queryClient.invalidateQueries({ queryKey: ['products'] }); // 商品データ再取得
        }, onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "販売に失敗しました。", "error");
        },
    })




    return (
     
                <Container maxWidth="xl" sx={{ py: 2 }}>
                    {/* メッセージ表示 */}
                    <CustomSnackbar
                        open={snackbar.open}
                        message={snackbar.message}
                        severity={snackbar.severity}
                        onClose={closeSnackbar}
                    />
                    {/* ページタイトル */}
                    <Typography
                        className="title"
                        variant="h4"
                        align="center"
                        fontWeight="bold"
                        sx={{ color: '#333', mb: 2 }}
                    >
                        購入
                    </Typography>

                    {/* ローディング表示 */}
                    {(productsLoading) && (
                        <Box textAlign="center" my={4}>
                            <CircularProgress />
                            <Typography>データを読み込み中...</Typography>
                        </Box>
                    )}

                    {/* エラー表示 */}
                    {(productsError) && (
                        <Typography className="error">データの取得に失敗しました。</Typography>
                    )}

                    <form >
                        <Grid
                            container
                            display="flex"
                            direction="row"
                            gap={4}
                            sx={{
                                justifyContent: {
                                    md: "center",
                                    lg: "space-between",
                                }
                            }}
                        >
                            <Grid
                                spacing={1}
                                minWidth={500}
                                size={{ xs: 12, md: 5 }}
                            >
                                {fields.map((_field, index) => (
                                    <Stack>

                                        <Stack
                                            spacing={1} minWidth={300}
                                            display="flex"
                                            direction="row"
                                            mb={2}
                                            key={index}
                                        >
                                            <Grid size={{ sm: 6, xs: 12 }} minWidth={180}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    label="商品名"
                                                    {...register(`items.${index}.productId`)}
                                                    error={!!errors.items?.[index]?.productId}
                                                    helperText={errors.items?.[index]?.productId?.message}
                                                    value={watch(`items.${index}.productId`) || ""}
                                                >
                                                    <MenuItem value="" disabled>
                                                        商品を選択してください
                                                    </MenuItem>
                                                    {productsData?.map((product) => (

                                                        <MenuItem key={product?.id} value={product?.id}>{product?.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid size={{ sm: 6, xs: 12 }} minWidth={100}>
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    label="数量"
                                                    {...register(`items.${index}.quantity`)}
                                                />
                                            </Grid>

                                            <Grid size={{ sm: 6, xs: 12 }} minWidth={200}>
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    label="単価"
                                                    {...register(`items.${index}.unitPrice`)}
                                                    slotProps={{
                                                        input: {
                                                            startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                                        }
                                                    }}
                                                />
                                            </Grid>


                                        </Stack>
                                        <Grid
                                            size={{ sm: 6, xs: 12 }}
                                            display="flex"
                                            justifyContent="space-between"
                                            maxWidth={80}
                                            alignItems="center"
                                        >

                                            <IconButton

                                                color="success"
                                                onClick={() => append({ productId: 0, quantity: 1, unitPrice: 1 })}
                                            >
                                                <AddBoxIcon />
                                            </IconButton>
                                            {fields.length > 1 && (

                                                <IconButton
                                                    color="error"
                                                    onClick={() => remove(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>

                                            )}
                                        </Grid>
                                    </Stack>
                                ))}
                            </Grid>
                            <Grid
                                spacing={1}
                                minWidth={500}
                                size={{ xs: 12, md: 5 }}
                            >
                                right
                            </Grid>
                        </Grid>
                    </form>
                </Container >
      
    )
}

export default SellPage;