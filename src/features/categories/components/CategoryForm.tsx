import Dialog from "@mui/material/Dialog";
import { Box, Button, DialogContent, DialogTitle, MenuItem, Stack, TextField, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useEffect, } from "react";
import FileInput from "./FileInput";
import type { CategoryFormData } from "../types/category";
import { STATUS } from "../../../constants/status";
import { StyledSelectTextField } from "../../../shared/components/global/select/StyledSelectTextField";
import { useScreen } from "../../../shared/hooks/ScreenContext";

/**
 * カテゴリ作成・編集用フォームモーダル
 *
 * Props:
 * - open: モーダル開閉フラグ
 * - onClose: 閉じる処理
 * - onSubmit: FormData送信処理
 * - category: 編集時の初期値
 */

type CategoryFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    category?: CategoryFormData;
}
const CategoryForm = ({
    open,
    onClose,
    onSubmit,
    category,
}: CategoryFormProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { isSM } = useScreen();

    const schema = yup.object({
        name: yup
            .string()
            .required("名前は必須です")
            .max(50, "名前は50文字以内で入  力してください"),
        status: yup
            .mixed<keyof typeof STATUS>()
            .required("ステータスは必須です")
            .oneOf(Object.values(STATUS).map(s => s.value), "ステータスはACTIVEまたはINACTIVEでなければなりません"),
        description: yup
            .string()
            .required("説明は必須です")
            .max(500, "説明は500文字以内で入力してください"),
        imageUrl: yup
            .mixed<File | string>()
            .nullable()
            .test(
                "required",
                "画像は必須です",
                value => value instanceof File || (typeof value === "string" && value.trim() !== "")
            )
    });

    // React Hook Form初期化
    const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
        resolver: yupResolver(schema) as Resolver<CategoryFormData>,
        defaultValues: {
            name: '',
            status: 'ACTIVE',
            description: '',
            imageUrl: null,
        }
    });

    // 編集時は初期値をフォームにセット
    useEffect(() => {
        if (category) {
            reset(category);
        }
    }, [category, reset]);

    // フォーム送信処理
    const handleFormSubmit = (data: CategoryFormData) => {
        // JSON部分をBlobに変換
        const categoryBlob = new Blob([JSON.stringify({
            name: data.name,
            status: data.status,
            description: data.description,
            imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined
        })], { type: "application/json" });

        // FormDataにまとめる
        const formData = new FormData();
        formData.append("category", categoryBlob);
        if (data.imageUrl instanceof File) {
            formData.append("file", data.imageUrl);
        }
        onSubmit(formData);
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
            maxWidth="md"
            fullScreen={isSM}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.greenAccent[900],
                        borderRadius: !isSM ? 2 : "none",
                        p: !isSM ? 2 : "none",
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    fontSize: { xs: 16, sm: 20 },
                    pb: { xs: 0, sm: 1 }
                }}
                textAlign="center">
                カテゴリを作成
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} mt={2}>
                    {/* カテゴリ名 */}
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="カテゴリ名"
                                variant="outlined"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                    {/* ステータス */}
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
                                sx={{ mb: 2, }}
                                bgColor={colors.greenAccent[900]}
                            >
                                <MenuItem value={STATUS.ACTIVE.value}>ACTIVE</MenuItem>
                                <MenuItem value={STATUS.INACTIVE.value}>INACTIVE</MenuItem>
                            </StyledSelectTextField>
                        )}
                    />
                    {/* 画像ファイル入力 */}
                    <Controller
                        name="imageUrl"
                        control={control}
                        render={({ field }) => (
                            <FileInput
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.imageUrl?.message}
                            />
                        )}
                    />
                    {/* 説明 */}
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
                    {/* ボタン */}
                    <Stack direction="row" gap={2} justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                        >
                            {`${category ? "編集" : "作成"}`}
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
        </Dialog >
    )
}
export default CategoryForm;