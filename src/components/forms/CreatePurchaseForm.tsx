import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, useTheme, Stack, Box, CircularProgress, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { tokens } from "../../theme";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ApiService from "../../services/ApiService";
import type { SupplierProductData } from "../../types/supplier";

interface CreateOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    supplier: {
        supplierName: string;
        supplierId: string;
    }[];

}

const CreateOrderDialog = ({
    open,
    onClose,
    onSave,
    supplier,
}: CreateOrderDialogProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const [products, setProducts] = useState<SupplierProductData[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProductData | null>(null);

    const schema = yup.object({
        supplierId: yup.string().required("仕入先は必須です"),
        productId: yup.string().required("商品は必須です"),
        sku: yup.string().notRequired(),

        description: yup.string()
            .matches(/^[a-zA-Z0-9\s]*$/, "文字と数字のみ入力できます。")
            .max(200, "説明の最大文字数は200文字です。"),
        quantity: yup.number()
            .positive("数量は正の数で入力してください")
            .integer("数量は整数で入力してください")
            .required("数量は必須です"),
        currentPrice: yup.number().notRequired(),
        total: yup.number().notRequired(),
    });
    const handleSave = () => {
        onSave();
        onClose();
    };


    const { control, handleSubmit, reset, formState: { errors }, getValues, watch, setValue } = useForm({
        defaultValues: {
            supplierId: "",
            productId: "",
            sku: "",
            description: "",
            quantity: 0,
            currentPrice: 0,
            total: 0,
        },
        resolver: yupResolver(schema),
        mode: "onBlur"
    });
    const selectedSupplierId = watch('supplierId');
    const selectedProductId = watch('productId');
    const quantityValue = watch('quantity');

    const fetchProducts = async (supplierId: number) => {
        const response = await ApiService.getSupplierProductsWithLeadTime(supplierId);
        return response.data[0].products;
    };
    useEffect(() => {
        if (selectedSupplierId) {
            fetchProducts(Number(selectedSupplierId)).then(data => {
                setProducts(data);
            });
        }
    }, [selectedSupplierId]);
    useEffect(() => {
        if (selectedProductId && products.length) {
            const product = products.find(p => p.id === Number(selectedProductId));
            if (product) {
                setSelectedProduct(product);
                setValue('currentPrice', product?.price);
                setValue('total', product.price * (quantityValue || 0));
            }
        }
    }, [selectedProductId, quantityValue, setValue, products]);

    return (
        <Dialog open={open} onClose={onClose}>


            <DialogTitle>新しい注文を作成</DialogTitle>
            <DialogContent>

                <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (

                        <TextField
                            label="仕入先"
                            select
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.supplierId}
                            helperText={errors.supplierId?.message}
                        >
                            {supplier?.map((sp) => (
                                <MenuItem key={sp.supplierId} value={sp.supplierId}>
                                    {sp.supplierName}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />
                <Controller
                    name="productId"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="商品名"
                            select
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.productId}
                            helperText={
                                products.length === 0
                                    ? "この仕入先には商品がありません"
                                    : errors.productId?.message
                            }
                        >
                            {products?.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.product}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />
                <Stack direction="row" spacing={2} mt={2} mb={1}>

                    <Controller
                        name="quantity"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="受領数量"
                                type="number"
                                fullWidth
                                margin="normal"
                                {...field}
                                error={!!errors.quantity}
                                helperText={errors.quantity?.message}

                            />
                        )}
                    />

                    <TextField
                        label="コスト"
                        value={selectedProduct?.price || 0}
                        fullWidth
                        margin="normal"
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                    />
                    <TextField
                        label="合計金額"
                        value={(selectedProduct?.price || 0) * (quantityValue || 0)}

                        fullWidth
                        margin="normal"
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                    />


                </Stack>

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="説明"
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">キャンセル</Button>
                <Button onClick={handleSave} color="primary">保存</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateOrderDialog;
