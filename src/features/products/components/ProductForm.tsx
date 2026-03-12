
import { useEffect } from 'react'
import type { ProductFormData, ProductStatus } from '../types/product';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, useTheme } from '@mui/material';
import { tokens } from '../../../shared/theme';
import type { CategoryData, CategorySummariesData } from '../../categories/types/category';
import { StyledSelectTextField } from '../../../shared/components/global/select/StyledSelectTextField';
import { STATUS } from '../../../constants/status';
import { useScreen } from '../../../shared/hooks/ScreenContext';

/** 
 * 商品フォームコンポーネント
 * 
 * 新規商品作成または既存商品の編集を行うフォーム
 * React Hook Form + Yupバリデーションを使用
 * 
 * @param open - フォームダイアログの開閉状態
 * @param onClose - ダイアログを閉じるコールバック
 * @param onSubmit - 新規商品の送信コールバック
 * @param onUpdate - 既存商品の更新コールバック
 * @param product - 編集対象の商品データ（省略可能）
 * @param categories - カテゴリ一覧データ
 */

type ProductFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: ProductFormData) => void;
    onUpdate?: (data: FormData) => void;
    product?: ProductFormData;
    categories: CategoryData[] | CategorySummariesData[];
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
    const { isSM } = useScreen();

    const getCategoryName = (cat: CategoryData | CategorySummariesData) =>
        "categoryName" in cat ? cat.categoryName : cat.name;

    const schema = yup.object({
        name: yup.string()
            .required("名前は必須です")
            .min(3, "名前は3文字以上でなければなりません")
            .max(100, "名前は100文字以内でなければなりません"),

        productCode: yup.string()
            .required("商品コードは必須です")
            .matches(/^[A-Za-z0-9\-]+$/, "商品コードは英数字とハイフンのみを含むことができます")
            .max(10, "商品コードは5文字以内で入力してください")
            .min(3, "商品コードは1文字以上で入力してください"),
        description: yup.string()
            .trim()
            .required("説明は必須です")
            .min(5, "説明は5文字以上でなければなりません")
            .max(500, "説明は500文字以内で入力してください"),

        status: yup.mixed<ProductStatus>()
            .oneOf(Object.values(STATUS).map(s => s.value), "ステータスは「ACTIVE」または「INACTIVE」のいずれかでなければなりません")
            .required("ステータスは必須です"),

        unit: yup.string()
            .required("単位は必須です")
            .max(5, "単位は5文字以内で入力してください")
            .min(1, "単位は1文字以上で入力してください"),
        categoryName: yup.string()
            .required("カテゴリ名は必須です")
            .min(3, "カテゴリ名は3文字以上でなければなりません"),
    });

    /** React Hook Formの初期化 */
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

    /** 編集モードの場合、フォームに既存の商品データをセット */
    useEffect(() => {
        if (product) {
            reset(product);
        }
    }, [product, reset]);

    /** フォーム送信処理 */
    const handleFormSubmit = (data: ProductFormData) => {
        if (product) {
            // 編集モードの場合FormDataで送信
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            onUpdate?.(formData);
        } else onSubmit?.(data); // 新規作成モード
        onClose();
    }
    return (
        /** 商品追加/編集ダイアログ */
        <Dialog
            open={open}
            onClose={(_e, reason) => {
                if (reason === 'backdropClick') {
                    return;
                }
                onClose();
            }}
            maxWidth="sm"
            fullScreen={isSM}
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: { sm: 2 }, p: 2 } }
            }}
        >
            <DialogTitle fontSize={20} textAlign="center">{`商品を${product ? '編集' : '追加'}`}</DialogTitle>
            <DialogContent>
                {/** フォーム全体 */}
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

                    {/** 商品コードとステータスを横並びで入力 */}
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
                                    <MenuItem value={STATUS.ACTIVE.value}>ACTIVE</MenuItem>
                                    <MenuItem value={STATUS.INACTIVE.value}>INACTIVE</MenuItem>
                                </StyledSelectTextField>
                            )}
                        />
                    </Stack>

                    {/** カテゴリと単位を横並びで入力 */}
                    <Stack direction="row" gap={3}>
                        <Controller
                            name="categoryName"
                            control={control}
                            render={({ field }) => (
                                <StyledSelectTextField
                                    select
                                    {...field}
                                    label="カテゴリ"
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
                                            value={getCategoryName(cat)}
                                        >
                                            {getCategoryName(cat)}
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

                    {/** 説明入力フィールド（複数行） */}
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

                    {/** フォーム操作ボタン */}
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