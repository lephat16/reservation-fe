import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import type { SupplierData } from "../types/supplier";

type SupplierFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SupplierData) => void;
    supplier?: SupplierData;
}
const SupplierForm = ({
    open,
    onClose,
    onSubmit,
    supplier
}: SupplierFormProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const schema = useMemo(() => yup.object({
        name: yup
            .string()
            .required("仕入先名は必須です。")
            .min(3, "名前は3文字以上で入力してください。")
            .max(100, "名前は100文字以内で入力してください。"),

        contactInfo: yup
            .string()
            .required("連絡先は必須です。")
            .matches(
                /^[0-9+()\-\s]{8,20}$/,
                "電話番号の形式が正しくありません。"
            )
            .min(10, "電話番号が短すぎます。")
            .max(13, "電話番号が長すぎます。"),

        mail: yup
            .string()
            .required("メールは必須です。")
            .email("有効なメールアドレスを入力してください。")
            .max(255, "メールは255文字以内で入力してください。"),

        address: yup
            .string()
            .required("住所は必須です。")
            .trim()
            .max(255, "住所は255文字以内で入力してください。")
            .matches(/[^\d]/, "住所は数字のみでは入力できません。")
            .min(10, "住所は少なくとも10文字以上である必要があります。"),

        supplierStatus: yup
            .string()
            .oneOf(["ACTIVE", "INACTIVE"], "'ACTIVE' または 'INACTIVE' のいずれかを選択してください。")
            .required("ステータスは必須です。"),
    }), []);

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SupplierData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            contactInfo: "",
            mail: "",
            address: "",
            supplierStatus: "INACTIVE"
        }
    });

    useEffect(() => {
        if (supplier) {
            reset(supplier);
        } else {
            reset({
                name: "",
                contactInfo: "",
                mail: "",
                address: "",
                supplierStatus: "ACTIVE"
            });
        }
    }, [supplier, reset]);

    const handleFormSubmit = (data: SupplierData) => {
        onSubmit(data);
        onClose();
    };
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
            <DialogTitle fontSize={20} textAlign="center">仕入先の登録</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} mt={2}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="仕入先名"
                                variant="outlined"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ''}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="住所"
                                variant="outlined"
                                fullWidth
                                error={!!errors.address}
                                helperText={errors.address ? errors.address.message : ''}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                    <Controller
                        name="mail"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="メール"
                                variant="outlined"
                                type="email"
                                fullWidth
                                error={!!errors.mail}
                                helperText={errors.mail ? errors.mail.message : ''}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Stack direction="row" gap={2}>
                        <Controller
                            name="supplierStatus"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="ステータス"
                                    select
                                    fullWidth
                                    {...field}
                                    error={!!errors.supplierStatus}
                                    helperText={errors.supplierStatus ? errors.supplierStatus.message : ''}
                                >
                                    <MenuItem value={"ACTIVE"}>ACTIVE</MenuItem>
                                    <MenuItem value={"INACTIVE"}>INACTIVE</MenuItem>
                                </TextField>
                            )}
                        />


                        <Controller
                            name="contactInfo"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="電話番号"
                                    variant="outlined"
                                    type="tel"
                                    fullWidth
                                    error={!!errors.contactInfo}
                                    helperText={errors.contactInfo ? errors.contactInfo.message : ''}
                                />
                            )}
                        />

                    </Stack>
                    <Stack direction="row" gap={2} justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            disabled={isSubmitting}
                        >
                            {/* {`${supplier ? "編集" : "登録"}`} */}
                            {isSubmitting ? "送信中..." : supplier ? "編集" : "登録"}
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

export default SupplierForm