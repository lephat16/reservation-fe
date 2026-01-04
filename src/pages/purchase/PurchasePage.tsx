import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../services/ApiService";
import './Purchase.css'
import {
    Badge,
    Box, Button, CircularProgress, Container,
    Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, FormControl, FormHelperText, Grid, IconButton, InputLabel,
    MenuItem, Select, Stack, styled, TextField, Typography
} from "@mui/material";
import NumberField from "../../components/fields/NumberField";
import type { PurchaseDataRequest, SupplierData } from "../../types";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import { useProducts } from "../../hooks/useProducts";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

/**
 * yup を使ったフォームバリデーションスキーマ
 * - productId, supplierId は必須かつ 1 以上
 * - quantity は 1〜100 の範囲
 * - description は最大 500文字
 * - note は最大 200文字
 */
const schema = yup.object({
    productId: yup
        .number()
        .required("商品を選択してください")
        .typeError("商品を選択してください")
        .min(1, "商品を選択してください"),
    supplierId: yup
        .number()
        .required("供給者を選択してください")
        .typeError("供給者を選択してください")
        .min(1, "供給者を選択してください"),
    quantity: yup
        .number()
        .required('数量は必須です')
        .min(1, '数量は1以上で入力してください')
        .max(100, '数量は100以下で入力してください'),
    description: yup
        .string()
        .max(500, '詳細は500文字以内で入力してください')
        .required("詳細を入力してください"),
    note: yup
        .string()
        .max(200, 'メモは200文字以内で入力してください')
        .required("メモを入力してください"),
});




type ProductItem = {
    productId: number,
    quantity: number,
    unitPrice: number,

}

type PurchaseRequestData = {
    transactionType: "PURCHASE",
    supplierId: number,
    description: string,
    note: string;
    items: ProductItem[];
}



const StyledButton = styled(IconButton)`
  position: fixed;
  z-index: 100;
  right: 20px;
  top: 20px;
`;

const PurchasePage = () => {

    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar(); // スナックバー管理用カスタムフック

    const [openCart, setOpenCart] = useState(false);
    const [purchaseItems, setPurchaseItems] = useState<PurchaseRequestData[]>([]);


    const [unitPrice, setUnitPrice] = useState(0); // 単価
    const [openConfirm, setOpenConfirm] = useState(false); // 注文確認ダイアログ開閉

    const [searchParams] = useSearchParams(); // URLのクエリパラメータ取得
    const productIdFromQuery = Number(searchParams.get("productId")) || 0;
    const navigate = useNavigate(); // 画面遷移用
    const [queryProcessed, setQueryProcessed] = useState(false);

    // 注文確認ダイアログ
    const handleCloseConfirm = () => setOpenConfirm(false);

    // 商品データ取得用 useProductsフック
    const { data: productsData,
        isLoading: productsLoading,
        error: productsError } = useProducts();

    // 供給者データ取得用
    const {
        data: suppliersData,
        isLoading: suppliersLoading,
        error: suppliersError } = useQuery<SupplierData[]>({
            queryKey: ["suppliers"],
            queryFn: async () => {
                const suppliersRes = await ApiService.getAllSuppliers();
                return suppliersRes.suppliers || [];
            },
        });

    // React Hook Form 初期化
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<PurchaseDataRequest>({
        resolver: yupResolver(schema),
        mode: "onBlur",
        defaultValues: {
            productId: 0,
            supplierId: 0,
            quantity: 1,
            description: "",
            note: ""
        }
    });

    // 購入用mutation  
    const purchaseMutation = useMutation({
        mutationFn: async (data: PurchaseRequestData) => {
            const purchaseRes = await ApiService.purchaseProduct(data); // API呼び出し
            return purchaseRes;
        },
        onSuccess: (response) => {
            showSnackbar(response.message || "購入完了", "success"); // スナックバー表示
            reset()
            setUnitPrice(0);
            queryClient.invalidateQueries({ queryKey: ['products'] }); // 商品データ再取得
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message ||
                "購入に失敗しました。", "error");

        }
    });


    const onFormSubmit = handleSubmit(() => setOpenConfirm(true));

    // watch で選択値を監視
    const productId = watch("productId");
    const supplierId = watch("supplierId");
    const quantity = watch("quantity");

    // 商品選択時に単価をセット
    useEffect(() => {
        if (productsData?.length && productId) {
            const selectedProduct = productsData.find((p) => p.id === productId);
            setUnitPrice(selectedProduct?.price || 0);
        }
    }, [productId, productsData]);

    // URLクエリから商品をプリセット
    useEffect(() => {
        if (queryProcessed || !productIdFromQuery || !productsData?.length) return;

        const selectedProduct = productsData.find(p => p.id === productIdFromQuery);
        if (!selectedProduct) return;

        setValue("productId", productIdFromQuery);
        setUnitPrice(selectedProduct.price);
        navigate("/purchase", { replace: true });  // URLをリセット
        setQueryProcessed(true);
    }, [productIdFromQuery, productsData, setValue, navigate, queryProcessed]);


    const handleAddClick = async () => {
        const valid = await trigger(["productId", "quantity", "supplierId"]);
        if (!valid) return;

        const quantityToAdd = getValues("quantity");

        const existingOrderIndex = purchaseItems.findIndex(o => o.supplierId === supplierId);
        let newPurchaseItems = [...purchaseItems];

        if (existingOrderIndex >= 0) {
            const order = newPurchaseItems[existingOrderIndex];
            const existingItemIndex = order.items.findIndex(i => i.productId === productId);
            if (existingItemIndex >= 0) {
                order.items[existingItemIndex].quantity += quantityToAdd;
            } else {
                order.items.push({ productId, quantity: quantityToAdd, unitPrice });
            }
        } else {
            newPurchaseItems.push({
                transactionType: "PURCHASE",
                supplierId,
                description: "",
                note: "",
                items: [{ productId, quantity: quantityToAdd, unitPrice }],

            });
        }

        setPurchaseItems(newPurchaseItems);
        setOpenCart(true);
        reset();
    };

    const [submitted, setSubmitted] = useState(false);
    const handleConfirmClick = async () => {
        setSubmitted(true);
        const hasInvalidItem = purchaseItems.some(item =>
            !item.description || item.description.length > 500 ||
            !item.note || item.note.length > 200
        );
        if (hasInvalidItem) {
            showSnackbar("詳細またはメモが不正です。文字数や必須項目を確認してください。", "error");
            return;
        }


        try {

            await Promise.all(
                purchaseItems.map(item => purchaseMutation.mutateAsync(item))
            );
            showSnackbar("全ての注文が完了しました", "success");
            reset();
            setUnitPrice(0);
            setPurchaseItems([]);
            setOpenCart(false);
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || "購入に失敗しました。", "error");
        } finally {
            handleCloseConfirm();
        }
    };

    const getTotalItems = () => {
        return purchaseItems.reduce((sum, p) => sum + p.items.length, 0);
    }
    return (
     
                <Container maxWidth="md" sx={{ py: 4 }}>
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
                    {(productsLoading || suppliersLoading) && (
                        <Box textAlign="center" my={4}>
                            <CircularProgress />
                            <Typography>データを読み込み中...</Typography>
                        </Box>
                    )}

                    {/* エラー表示 */}
                    {(productsError || suppliersError) && (
                        <p className="error">データの取得に失敗しました。</p>
                    )}
                    <StyledButton onClick={() => setOpenCart(true)}>
                        <Badge badgeContent={getTotalItems()} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    </StyledButton>
                    {/* フォーム */}
                    <form onSubmit={onFormSubmit}>
                        <Grid className="purchase-form-page" container spacing={1}>

                            {/* 商品選択 */}
                            <Grid size={{ md: 12, xs: 12 }}>
                                <Typography >商品</Typography>
                                <FormControl
                                    fullWidth
                                    error={!!errors.productId}
                                    sx={{ mt: 1 }}
                                >
                                    <InputLabel id="select-required-product">選択してください</InputLabel>
                                    <Select
                                        labelId="select-required-product"
                                        id="select-required"
                                        {...register("productId")}
                                        value={productId || ""}
                                        label="選択してください *"
                                        onChange={(e) => {
                                            setValue("productId", Number(e.target.value))
                                        }}
                                    >
                                        {productsData?.map((product) => (
                                            <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {errors.productId && (
                                        <FormHelperText>{errors.productId.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* 供給者選択 */}
                            <Grid size={{ md: 12, xs: 12 }}>
                                <Typography>供給者</Typography>
                                <FormControl
                                    fullWidth
                                    error={!!errors.supplierId}
                                    sx={{ mt: 1 }}
                                >
                                    <InputLabel id="select-required-supplier">選択してください</InputLabel>
                                    <Select
                                        labelId="select-required-supplier"
                                        id="select-required"
                                        {...register("supplierId")}
                                        value={supplierId || ""}
                                        label="選択してください *"
                                        onChange={(e) =>
                                            setValue("supplierId", Number(e.target.value))
                                        }
                                    >
                                        {suppliersData?.map((supplier) => (
                                            <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {errors.supplierId && (
                                        <FormHelperText>{errors.supplierId.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* 数量・単価・合計 */}
                            <Grid size={{ md: 12, xs: 12 }}>
                                <Stack
                                    spacing={{ xs: 1, sm: 2 }}
                                    direction="column"
                                    m={0}
                                >
                                    <Box>
                                        <Typography mb={1}>数量</Typography>
                                        <NumberField

                                            value={quantity}
                                            min={1}
                                            // max={100}
                                            onValueChange={(value) =>
                                                setValue("quantity", Number(value))
                                            }
                                            error={!!errors.quantity}
                                        />
                                        {errors.quantity && (
                                            <p className="error">{errors.quantity.message}</p>
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
                                            <span>{((quantity || 0) * (unitPrice || 0)).toLocaleString()} 円</span>
                                        </div>
                                    </Stack>
                                </Stack>
                            </Grid>
                            <Button type="button" onClick={handleAddClick}>
                                Add
                            </Button>
                            <Dialog
                                open={openCart}
                                onClose={() => setOpenCart(false)}
                                maxWidth="sm"
                                fullWidth>
                                <DialogTitle id="add-item-dialog-title">確認: 商品を追加</DialogTitle>
                                <DialogContent>
                                    {purchaseItems.length > 0 && (
                                        purchaseItems.map((purchase, index) => (
                                            <div key={index}>
                                                <p>供給者ID: {purchase.supplierId}</p>
                                                {purchase.items.map((item, i) => (
                                                    <div key={i}>
                                                        <p>数量: {item.quantity}</p>
                                                        <p>単価: {item.unitPrice.toLocaleString()} 円</p>
                                                        <p>合計: {(item.unitPrice * item.quantity).toLocaleString()} 円</p>
                                                    </div>
                                                ))}
                                                {/* 詳細・メモ */}
                                                <Grid size={{ md: 12, xs: 12 }}>
                                                    <Stack
                                                        spacing={{ xs: 1, sm: 2 }}
                                                        direction="column"
                                                    >
                                                        <TextField
                                                            multiline
                                                            label="詳細"
                                                            rows={4}
                                                            value={purchase.description}
                                                            onChange={(e) => {
                                                                setPurchaseItems(prev => prev.map((p, idx) =>
                                                                    idx === index ? { ...p, description: e.target.value } : p
                                                                ));
                                                            }}
                                                            error={submitted && (!purchase.description || purchase.description.length > 500)}
                                                            helperText={submitted
                                                                ? !purchase.description
                                                                    ? "詳細は必須です"
                                                                    : purchase.description.length > 500
                                                                        ? "詳細は500文字以内で入力してください"
                                                                        : ""
                                                                : ""
                                                            }
                                                        // sx={{ maxWidth: '300px' }}
                                                        />
                                                        <TextField
                                                            multiline
                                                            label="メモ"
                                                            rows={2}
                                                            value={purchase.note}
                                                            onChange={(e) => {
                                                                setPurchaseItems(prev => prev.map((p, idx) =>
                                                                    idx === index ? { ...p, note: e.target.value } : p
                                                                ));
                                                            }}
                                                            error={submitted && (!purchase.note || purchase.note.length > 200)}
                                                            helperText={submitted
                                                                ? !purchase.note
                                                                    ? "メモは必須です"
                                                                    : purchase.note.length > 200
                                                                        ? "メモは200文字以内で入力してください"
                                                                        : ""
                                                                : ""
                                                            }
                                                        // sx={{ maxWidth: '300px' }}
                                                        />
                                                    </Stack>
                                                </Grid>
                                            </div>)
                                        ))}

                                    {/* 送信ボタン */}
                                    <Stack spacing={1} direction="row" sx={{ mt: 2 }}>
                                        {/* Submit button */}
                                        <Button
                                            type="submit"

                                            disabled={purchaseMutation.isPending}
                                            onClick={handleConfirmClick}
                                            variant="contained"
                                        >
                                            {purchaseMutation.isPending ? "処理中..." : "注文を確定する"}
                                        </Button>

                                        {/* Clear button */}
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => {
                                                setOpenCart(false);
                                            }}
                                        >
                                            クリア
                                        </Button>
                                    </Stack>
                                </DialogContent>
                            </Dialog>
                            {/* 詳細・メモ */}
                            {/* <Grid size={{ md: 12, xs: 12 }}>
                                <Stack
                                    spacing={{ xs: 1, sm: 2 }}
                                    direction="column"
                                >
                                    <TextField
                                        multiline
                                        label="詳細"
                                        rows={4}
                                        {...register("description")}
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    // sx={{ maxWidth: '300px' }}
                                    />
                                    <TextField
                                        multiline
                                        label="メモ"
                                        rows={2}
                                        {...register("note")}
                                        error={!!errors.note}
                                        helperText={errors.note?.message}
                                    // sx={{ maxWidth: '300px' }}
                                    />
                                </Stack>
                            </Grid> */}

                            {/* 送信ボタン */}
                            {/* <Button type="submit" disabled={purchaseMutation.isPending} sx={{ mt: 1 }}>
                                {purchaseMutation.isPending ? "処理中..." : "注文を確定する"}
                            </Button> */}
                            {/* 確認ダイアログ */}
                            <Dialog
                                open={openConfirm}
                                onClose={handleCloseConfirm}
                                aria-labelledby="confirm-dialog-title"
                                aria-describedby="confirm-dialog-description"
                            >
                                <DialogTitle id="confirm-dialog-title">注文を確定しますか？</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="confirm-dialog-description">
                                        この内容で注文を確定してもよろしいですか？
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCloseConfirm} color="primary">キャンセル</Button>
                                    {/* <Button onClick={handleSubmit(onSubmit)} color="primary" autoFocus>確定</Button> */}
                                </DialogActions>
                            </Dialog>
                        </Grid>
                    </form>
                </Container>

  
    )
}

export default PurchasePage;