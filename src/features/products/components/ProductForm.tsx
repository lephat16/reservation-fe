
import { useEffect } from 'react'
import type { ProductFormData, ProductStatus } from '../types/product';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, useTheme } from '@mui/material';
import { tokens } from '../../../shared/theme';
import type { CategoryData } from '../../categories/types/category';
import { StyledSelectTextField } from '../../../shared/styles/StyledSelectTextField';

type ProductFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: ProductFormData) => void;
    onUpdate?: (data: FormData) => void;
    product?: ProductFormData;
    categories: CategoryData[];
}

const ProductForm = ({
    open,
    onClose,
    onSubmit,
    onUpdate,
    product,
    categories,
}: ProductFormProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const schema = yup.object({
        name: yup.string()
            .required("名前は必須です")
            .min(3, "名前は3文字以上でなければなりません")
            .max(100, "名前は100文字以内でなければなりません"),

        productCode: yup.string()
            .required("商品コードは必須です")
            .matches(/^[A-Za-z0-9]+$/, "商品コードは英数字のみを含むことができます")
            .max(10, "単位は5文字以内で入力してください")
            .min(3, "単位は1文字以上で入力してください"),
        description: yup.string()
            .trim()
            .required("説明は必須です")
            .min(5, "説明は5文字以上でなければなりません")
            .max(500, "説明は500文字以内で入力してください"),

        status: yup.mixed<ProductStatus>()
            .oneOf(["ACTIVE", "INACTIVE"], "ステータスは「ACTIVE」または「INACTIVE」のいずれかでなければなりません")
            .required("ステータスは必須です"),

        unit: yup.string()
            .required("単位は必須です")
            .max(5, "単位は5文字以内で入力してください")
            .min(1, "単位は1文字以上で入力してください"),
        categoryName: yup.string()
            .required("カテゴリ名は必須です")
            .min(3, "カテゴリ名は3文字以上でなければなりません"),
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            productCode: '',
            description: '',
            status: 'INACTIVE',
            unit: '',
            categoryName: '',
        }
    });

    useEffect(() => {
        if (product) {
            reset(product);
        }
    }, [product, reset]);

    const handleFormSubmit = (data: ProductFormData) => {
        if (product) {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            onUpdate?.(formData);
        } else onSubmit?.(data);
        onClose();
    }
    return (
        <Dialog
            open={open}
            onClose={(_e, reason) => {
                if (reason === 'backdropClick') {
                    return;
                }
                onClose();
            }}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: 2, p: 2 } }
            }}
        >
            <DialogTitle fontSize={20} textAlign="center">商品を追加</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} mt={2}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="商品名"
                                variant="outlined"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                    <Stack direction="row" gap={3}>

                        <Controller
                            name="productCode"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="コード"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.productCode}
                                    helperText={errors.productCode ? errors.productCode.message : ' '}
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <StyledSelectTextField
                                    select
                                    {...field}
                                    label="ステータス"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.status}
                                    helperText={errors.status ? errors.status.message : ' '}
                                    sx={{ mb: 2 }}
                                    bgColor={colors.greenAccent[900]}
                                >
                                    <MenuItem value={"ACTIVE"}>ACTIVE</MenuItem>
                                    <MenuItem value={"INACTIVE"}>INACTIVE</MenuItem>
                                </StyledSelectTextField>
                            )}
                        />
                    </Stack>
                    <Stack direction="row" gap={3}>

                        <Controller
                            name="categoryName"
                            control={control}
                            render={({ field }) => (
                                <StyledSelectTextField
                                    select
                                    {...field}
                                    label="カテゴリー"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.categoryName}
                                    helperText={errors.categoryName ? errors.categoryName.message : ' '}
                                    sx={{ mb: 2 }}
                                    bgColor={colors.greenAccent[900]}
                                >
                                    {categories.map(cat => (
                                        <MenuItem
                                            key={cat.id}
                                            value={cat.name}
                                        >
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </StyledSelectTextField>
                            )}
                        />

                        <Controller
                            name="unit"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="単位"
                                    placeholder='個,本,台...'
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.unit}
                                    helperText={errors.unit ? errors.unit.message : ' '}
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />
                    </Stack>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="説明"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                error={!!errors.description}
                                helperText={errors.description ? errors.description.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                    <Stack direction="row" gap={2} justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                        >
                            {`${product ? "編集" : "追加"}`}
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={onClose}
                        >
                            キャンセル
                        </Button>

                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default ProductForm;