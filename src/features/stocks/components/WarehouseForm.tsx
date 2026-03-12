import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    useTheme
} from "@mui/material";
import { tokens } from "../../../shared/theme";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import type { WarehouseFormData } from "../types/stock";
import { useEffect } from "react";
import { STATUS } from "../../../constants/status";
import { StyledSelectTextField } from "../../../shared/components/global/select/StyledSelectTextField";
import { useScreen } from "../../../shared/hooks/ScreenContext";

/**
 * 倉庫作成・編集フォーム
 * 
 * 倉庫情報（名前、住所、在庫上限、ステータス）を入力し、作成または編集を行うフォーム
 * 
 * @param open - ダイアログが開いているかどうか
 * @param onClose - ダイアログを閉じるコールバック
 * @param onSubmit - フォームが送信されたときに呼ばれるコールバック
 * @param warehouse - 編集対象の倉庫情報（新規作成の場合は省略可）
 */

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
    const { isSM } = useScreen();

    const schema = yup.object().shape({
        name: yup.string().required("倉庫名は必須です").min(3, "倉庫名は3文字以上で入力してください"),
        location: yup.string().required("住所は必須です"),
        stockLimit: yup.number().required("在庫上限は必須です").min(1, "在庫上限は1以上でなければなりません"),
        status: yup
            .mixed<'ACTIVE' | 'INACTIVE'>()
            .oneOf(['ACTIVE', 'INACTIVE'], "ステータスは 'ACTIVE' または 'INACTIVE' のいずれかでなければなりません")
            .required("ステータスは必須です"),
    });

    // フォームの状態とバリデーションを管理
    const { control, handleSubmit, formState: { errors }, reset } = useForm<WarehouseFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            location: '',
            stockLimit: 0,
            status: STATUS.ACTIVE.value,
        }
    });

    // 編集モード時にフォームを初期化
    useEffect(() => {
        if (warehouse) {
            reset(warehouse);
        }
    }, [warehouse, reset]);

    // フォーム送信時の処理
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
            fullScreen={isSM}
            slotProps={{
                paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: { sm: 2 }, p: 2 } }
            }}
        >
            <DialogTitle fontSize={20} textAlign="center">{`倉庫を${warehouse ? '編集' : '作成'}`}</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} mt={2}>
                    {/* 倉庫名の入力フィールド */}
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
                                helperText={errors.name ? errors.name.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                    {/* 住所の入力フィールド */}
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
                                helperText={errors.location ? errors.location.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    <Stack direction="row" gap={2}>
                        {/* ステータスの選択フィールド */}
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <StyledSelectTextField
                                    label="ステータス"
                                    select
                                    fullWidth
                                    margin="normal"
                                    {...field}
                                    error={!!errors.status}
                                    helperText={errors.status ? errors.status.message : ' '}
                                    bgColor={colors.greenAccent[900]}
                                >
                                    <MenuItem value={STATUS.ACTIVE.value}>ACTIVE</MenuItem>
                                    <MenuItem value={STATUS.INACTIVE.value}>INACTIVE</MenuItem>
                                </StyledSelectTextField>
                            )}
                        />
                        {/* 在庫上限の入力フィールド */}
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
                                    helperText={errors.stockLimit ? errors.stockLimit.message : ' '}
                                />
                            )}
                        />
                    </Stack>
                    {/* ボタン群 */}
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