import { Box, Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import type { WarehouseFormData } from "../types/stock";
import { useEffect } from "react";




type WarehouseFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: WarehouseFormData) => void;
    warehouse?: WarehouseFormData;
}
const WarehouseForm = ({
    open,
    onClose,
    onSubmit,
    warehouse
}: WarehouseFormProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const schema = yup.object().shape({
        name: yup.string().required("倉庫名は必須です").min(3, "倉庫名は3文字以上で入力してください"),
        location: yup.string().required("住所は必須です"),
        stockLimit: yup.number().required("在庫上限は必須です").min(1, "在庫上限は1以上でなければなりません"),
        status: yup
            .mixed<'ACTIVE' | 'INACTIVE'>()
            .oneOf(['ACTIVE', 'INACTIVE'], "ステータスは 'ACTIVE' または 'INACTIVE' のいずれかでなければなりません")
            .required("ステータスは必須です"),
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm<WarehouseFormData>({
        resolver: yupResolver(schema),
        defaultValues: warehouse || {
            name: '',
            location: '',
            stockLimit: 0,
            status: "ACTIVE",
        }
    });

    useEffect(() => {
        if (warehouse) {
            reset(warehouse);
        } else {
            reset({
                name: '',
                location: '',
                stockLimit: 0,
                status: 'ACTIVE',
            }); 
        }
    }, [warehouse, reset]);

    const handleFormSubmit = (data: WarehouseFormData) => {
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
            <DialogTitle fontSize={20} textAlign="center">倉庫を作成</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} mt={2}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="倉庫名"
                                variant="outlined"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ''}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="住所"
                                variant="outlined"
                                fullWidth
                                error={!!errors.location}
                                helperText={errors.location ? errors.location.message : ''}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Stack direction="row" gap={2}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="ステータス"
                                    select
                                    fullWidth
                                    margin="normal"
                                    {...field}
                                    error={!!errors.status}
                                    helperText={errors.status ? errors.status.message : ''}
                                >
                                    <MenuItem value={"ACTIVE"}>ACTIVE</MenuItem>
                                    <MenuItem value={"INACTIVE"}>INACTIVE</MenuItem>
                                </TextField>
                            )}
                        />
                        <Controller
                            name="stockLimit"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="在庫上限"
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    {...field}
                                    error={!!errors.stockLimit}
                                    helperText={errors.stockLimit ? errors.stockLimit.message : ''}
                                />
                            )}
                        />
                    </Stack>
                    <Stack direction="row" gap={2} justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                        >
                            {`${warehouse ? "編集" : "作成"}`}
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

export default WarehouseForm