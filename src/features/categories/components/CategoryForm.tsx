import Dialog from "@mui/material/Dialog";
import { Box, Button, DialogContent, DialogTitle, MenuItem, Stack, TextField, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useEffect, } from "react";
import FileInput from "./FileInput";
import type { CategoryFormData } from "../types/category";




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

    const schema = yup.object({
        name: yup
            .string()
            .required("名前は必須です")
            .max(50, "名前は50文字以内で入  力してください"),
        status: yup
            .mixed<"ACTIVE" | "INACTIVE">()
            .required("ステータスは必須です")
            .oneOf(["ACTIVE", "INACTIVE"], "ステータスはACTIVEまたはINACTIVEでなければなりません"),
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

    const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
        resolver: yupResolver(schema) as Resolver<CategoryFormData>,
        defaultValues: {
            name: '',
            status: 'ACTIVE',
            description: '',
            imageUrl: null,
        }
    });

    useEffect(() => {
        if (category) {
            reset(category);
        }
    }, [category, reset]);


    const handleFormSubmit = (data: CategoryFormData) => {
        const categoryBlob = new Blob([JSON.stringify({
            name: data.name,
            status: data.status,
            description: data.description,
            imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined
        })], { type: "application/json" });

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
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: 2, p: 2 } }
            }}
        >
            <DialogTitle fontSize={20} textAlign="center">カテゴリーを作成</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} mt={2}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="カテゴリー名"
                                variant="outlined"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                select
                                {...field}
                                label="ステータス"
                                variant="outlined"
                                fullWidth
                                error={!!errors.status}
                                helperText={errors.status ? errors.status.message : ' '}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value={"ACTIVE"}>ACTIVE</MenuItem>
                                <MenuItem value={"INACTIVE"}>INACTIVE</MenuItem>
                            </TextField>
                        )}
                    />
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