import { Box, Button, FormGroup, Grid, MenuItem, Stack, TextField, useTheme } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { UserData, UserRequestData } from '../types/user';
import { ROLES } from '../../../constants/role';
import { StyledSelectTextField } from '../../../shared/styles/StyledSelectTextField';
import { blueGrey } from '@mui/material/colors';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect } from 'react';

const roleValues = Object.keys(ROLES) as Array<keyof typeof ROLES>;
const schema = yup.object({
    name: yup
        .string()
        .required("仕入先名は必須です。")
        .min(3, "名前は3文字以上で入力してください。")
        .max(100, "名前は100文字以内で入力してください。"),

    phoneNumber: yup
        .string()
        .required("連絡先は必須です。")
        .matches(
            /^[0-9+()\-\s]{8,20}$/,
            "電話番号の形式が正しくありません。"
        )
        .min(10, "電話番号が短すぎます。")
        .max(16, "電話番号が長すぎます。"),

    email: yup
        .string()
        .required("メールは必須です。")
        .email("有効なメールアドレスを入力してください。")
        .max(255, "メールは255文字以内で入力してください。"),

    role: yup
        .mixed<keyof typeof ROLES>()
        .oneOf(roleValues)
        .required("ステータスは必須です。")
});

type UserEditProps = {
    user: UserData | null;
    mode: "create" | "edit";
    onBack: () => void;
    onSubmit: (user: UserRequestData) => void;
}
const UserForm = ({
    user,
    onBack,
    mode,
    onSubmit,
}: UserEditProps) => {

    const theme = useTheme();
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<UserRequestData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            phoneNumber: "",
            email: "",
            role: "STAFF",
        }
    });

    useEffect(() => {
        if (mode === "edit" && user) {
            reset({
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            });
        }

        if (mode === "create") {
            reset({
                name: "",
                email: "",
                phoneNumber: "",
                role: "STAFF",
            });
        }
    }, [user, mode, reset]);


    const handleFormSubmit = (data: UserRequestData) => {
        onSubmit(data);

    }
    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            autoComplete="off"
            // onReset={handleReset}
            sx={{ width: '100%' }}
        >


            <FormGroup>
                <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
                    {mode === "edit" && (
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                            <TextField
                                label="ID"
                                value={user?.userId}
                                variant="filled"
                                fullWidth
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                    htmlInput: {
                                        style: {
                                            cursor: "pointer",
                                        }
                                    },
                                    inputLabel: { shrink: true }
                                }}
                                sx={{
                                    flex: 2,
                                }}
                            />
                        </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="名前"
                                    variant="filled"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name ? errors.name.message : ' '}
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="メールアドレス"
                                    variant="filled"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email ? errors.email.message : ' '}
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="電話番号"
                                    variant="filled"
                                    fullWidth
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber ? errors.phoneNumber.message : ' '}
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <StyledSelectTextField
                                    {...field}
                                    label="役割"
                                    select
                                    variant="filled"
                                    fullWidth
                                    error={!!errors.role}
                                    helperText={errors.role ? errors.role.message : ' '}
                                    sx={{ mb: 2 }}
                                    bgColor={theme.alpha(blueGrey[900], 1)}

                                >
                                    {Object.values(ROLES).map((role) => (
                                        <MenuItem key={role.value} value={role.value}>
                                            {role.label}
                                        </MenuItem>
                                    ))}
                                </StyledSelectTextField>
                            )}
                        />
                    </Grid>
                </Grid>
            </FormGroup>
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                >
                    保存
                </Button>
            </Stack>
        </Box >
    )
}

export default UserForm