import ApiService from "../../services/ApiService";
import {
    Box,
    Button,
    TextField,
    Grid,
    MenuItem,
    Typography,
    Container,
    CircularProgress,
    Stack,
    IconButton,
    InputAdornment
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../hooks/useSnackbar";
import type { SupplierData } from "../../types";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';

// ====== Types ======
type Item = {
    productId: number;
    quantity: number;
    unitPrice: number;
};

type PurchaseRequest = {
    supplierId: number;
    description: string;
    note: string;
    items: Item[];
};

const schemaPurchase = yup.object({
    supplierId: yup
        .number()
        .required("供給者を選択してください")
        .typeError("供給者を選択してください")
        .min(1, "供給者を選択してください"),
    description: yup
        .string()
        .max(500, '詳細は500文字以内で入力してください')
        .required("詳細を入力してください"),
    note: yup
        .string()
        .max(200, 'メモは200文字以内で入力してください')
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
                .required('数量は必須です')
                .min(1, '数量は1以上で入力してください')
                .max(100, '数量は100以下で入力してください'),
            unitPrice: yup
                .number()
                .required('単価は必須です')
                .min(1, '単価は1以上で入力してください')
        })
    ).required().min(1, "少なくとも1つの商品が必要です")
});

const PurchaseForm = () => {


    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar(); // スナックバー管理用カスタムフック

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
        reset,
        control,
        formState: { errors },
        watch,
    } = useForm<PurchaseRequest>({
        resolver: yupResolver(schemaPurchase),
        mode: "onBlur",
        defaultValues: {
            supplierId: 0,
            description: "",
            note: "",
            items: [
                { productId: 0, quantity: 1, unitPrice: 1 }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // 購入用mutation  
    const purchaseMutation = useMutation({
        mutationFn: async (data: PurchaseRequest) => {
            const purchaseRes = await ApiService.purchaseProduct(data); // API呼び出し
            return purchaseRes;
        },
        onSuccess: (response) => {
            showSnackbar(response.message || "購入完了", "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ['products'] }); // 商品データ再取得
            reset();
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message ||
                "購入に失敗しました。", "error");
        }
    });

    const onSubmit = (data: PurchaseRequest) => {
        purchaseMutation.mutate(data)
    }

    const handleCancel = () => {
        reset();
    }
    const total = watch("items")?.reduce((sum, item) =>
        sum + item.quantity * item.unitPrice, 0
    ) ?? 0;
    const supplierId = watch("supplierId")
        
    const { data: productsData,
        isLoading: productsLoading,
        error: productsError } = useQuery({
            queryKey: ["products", supplierId], 
            queryFn: async () => {
                const productsRes = await ApiService.getProductsBySupplier(supplierId);
                console.log(productsRes)
                return productsRes.products || [];
            },
            enabled: !!supplierId,
            placeholderData: (previousData) => previousData,
        });
    
    console.log(productsData)

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
                    {(productsLoading || suppliersLoading) && (
                        <Box textAlign="center" my={4}>
                            <CircularProgress />
                            <Typography>データを読み込み中...</Typography>
                        </Box>
                    )}

                    {/* エラー表示 */}
                    {(productsError || suppliersError) && (
                        <Typography className="error">データの取得に失敗しました。</Typography>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <Grid
                            container
                            display="flex"
                            direction="row"
                            gap={4}
                            justifyContent="center"
                        >
                            <Grid
                                spacing={1}
                                minWidth={500}
                                size={{ xs: 12, md: 5 }}
                            >
                                <Grid size={{ md: 12, xs: 12 }} pb={3}>
                                    <Typography>供給者</Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        label="選択してください"
                                        {...register("supplierId")}
                                        error={!!errors.supplierId}
                                        helperText={errors.supplierId?.message}
                                        sx={{ mt: 2 }}
                                        // placeholder=""
                                        value={watch("supplierId") || ""}
                                        // defaultValue=""
                                    >
                                        <MenuItem value="" disabled>
                                            供給者を選択してください
                                        </MenuItem>
                                        {suppliersData?.map((supplier) => (
                                            <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                                        ))}
                                    </TextField>
                                    {/* <Controller
                                        control={control}
                                        name="supplierId"
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                fullWidth
                                                label="選択してください"
                                                {...field}
                                                value={field.value ?? ""}      
                                                error={!!errors.supplierId}
                                                helperText={errors.supplierId?.message}
                                                sx={{ mt: 2 }}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            >
                                                <MenuItem value="" disabled>供給者を選択してください</MenuItem>
                                                {suppliersData?.map((supplier) => (
                                                    <MenuItem key={supplier.id} value={supplier.id}>
                                                        {supplier.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    /> */}
                                </Grid>
                                <Grid size={{ md: 12, xs: 12 }} pb={3}>
                                    <Typography>詳細</Typography>
                                    <TextField
                                        fullWidth
                                        // label="入力してください"
                                        multiline
                                        rows={3}
                                        {...register("description")}
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                        sx={{ mt: 2 }}
                                        placeholder="例: 在庫補充用の注文"
                                    />
                                </Grid>
                                <Grid size={{ md: 12, xs: 12 }}>
                                    <Typography>メモ</Typography>
                                    <TextField
                                        fullWidth
                                        // label="入力してください"
                                        multiline
                                        rows={2}
                                        {...register("note")}
                                        error={!!errors.note}
                                        helperText={errors.note?.message}
                                        sx={{ mt: 2 }}
                                        placeholder="例: 週末用の在庫補充"
                                    />
                                </Grid>

                            </Grid>
                            {/* <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} /> */}
                            <Grid minWidth={500} size={{ xs: 12, md: 6 }}>
                                {fields.map((_field, index) => (
                                    <Stack className="purchase-item"
                                        spacing={1} minWidth={300}
                                        display="flex"
                                        direction="row"
                                        mb={2}
                                        mt={5}
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
                        </Grid>

                        <Stack>
                            <Typography align="right" sx={{ mt: 3, fontWeight: "bold" }}>
                                Total: ¥{total.toLocaleString()}
                            </Typography>
                            <Box display="flex" justifyContent="center" mt={4} gap={3}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={{ maxWidth: "100px" }}
                                >
                                    Cancel</Button>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    sx={{ maxWidth: "100px" }}
                                    disabled={purchaseMutation.isPending}
                                >
                                    {purchaseMutation.isPending ? "処理中..." : "Submit"}
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Container>
 

    );
};

export default PurchaseForm;
