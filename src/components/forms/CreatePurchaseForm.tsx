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
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const schema = yup.object({
        supplierName: yup.string().required("仕入先は必須です"),
        productName: yup.string().required("商品は必須です"),
        sku: yup.string().required("skuは必須です"),
        currentPrice: yup.number()
            .positive("コストは正の数で入力してください")
            .integer("コストは整数で入力してください")
            .required("コストは必須です"),
        description: yup.string()
            .matches(/^[a-zA-Z0-9\s]*$/, "文字と数字のみ入力できます。")
            .max(200, "説明の最大文字数は200文字です。"),
        quantity: yup.number()
            .positive("数量は正の数で入力してください")
            .integer("数量は整数で入力してください")
            .required("数量は必須です"),
        total: yup.number()
            .positive("数量は正の数で入力してください")
            .integer("数量は整数で入力してください")
            .required("数量は必須です"),
    });
    const handleSave = () => {
        onSave();
        onClose();
    };


    const { control, handleSubmit, reset, formState: { errors }, getValues, watch, setValue } = useForm({
        defaultValues: {
            supplierName: "",
            productName: "",
            sku: "",
            currentPrice: 0,
            description: "",
            quantity: 0,
            total: 0,
        },
        resolver: yupResolver(schema),
        mode: "onBlur"
    });
    const selectedSupplierId = watch('supplierName');
    const selectedProductId = watch('productName');
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
                if(selectedProduct) {
                    const total = selectedProduct.price * quantityValue;
                    setValue('total', total);
                }
            }
        }
    }, [selectedProductId, products, setValue]);
    
    return (
        <Dialog open={open} onClose={onClose}>


            <DialogTitle>新しい注文を作成</DialogTitle>
            <DialogContent>

                <Controller
                    name="supplierName"
                    control={control}
                    render={({ field }) => (

                        <TextField
                            label="仕入先"
                            select
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.supplierName}
                            helperText={errors.supplierName?.message}
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
                    name="productName"
                    control={control}
                    render={({ field }) => (

                        <TextField
                            label="商品名"
                            select
                            fullWidth
                            margin="normal"
                            {...field}
                            error={!!errors.productName}
                            helperText={errors.productName?.message}
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
                    <Controller
                        name="currentPrice"
                        control={control}
                        render={() => (
                            <TextField
                                label="コスト"
                                fullWidth
                                margin="normal"
                                value={selectedProduct?.price || 0}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        )}
                    />
                    <Controller
                        name="total"
                        control={control}
                        render={({ field, fieldState }) => {
                            const total = selectedProduct?.price * (quantityValue || 0) || 0;
                            return (
                                <TextField
                                    {...field}
                                    label="合計金額"
                                    fullWidth
                                    margin="normal"
                                    value={total}
                                    error={!!fieldState?.error}
                                    helperText={fieldState?.error?.message}
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            );
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
