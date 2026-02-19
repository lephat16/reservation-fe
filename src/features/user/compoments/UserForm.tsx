import { FormGroup, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

type UserRequestData = {
    name: string;
    email: string;
    phoneNumber: string;
    role: "ADMIN" | "STAFF" | "WAREHOUSE";
}
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
        .string()
        .oneOf(["ADMIN", "STAFF", "WAREHOUSE"], "'STAFF' または 'WAREHOUSE', 'ADMIN' のいずれかを選択してください。")
        .required("ステータスは必須です。"),
});
const UserForm = () => {

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<UserRequestData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            phoneNumber: "",
            role: "STAFF"
        }
    });
    return (
        <FormGroup>
            <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
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
                                helperText={errors.name ? errors.name.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
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
                                helperText={errors.name ? errors.name.message : ' '}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
        </FormGroup>
    )
}

export default UserForm