import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type Resolver } from "react-hook-form";

type CategoryFormData = {
    name: string;
    status: "ACTIVE" | "INACTIVE";
    description: string;
    imageUrl: string | null;
};
type CategoryFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
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
            .max(50, "名前は50文字以内で入力してください"),
        status: yup
            .mixed<"ACTIVE" | "INACTIVE">()
            .required("ステータスは必須です")
            .oneOf(["ACTIVE", "INACTIVE"], "ステータスはACTIVEまたはINACTIVEでなければなりません"),
        description: yup
            .string()
            .required("説明は必須です")
            .max(500, "説明は500文字以内で入力してください"),
        imageUrl: yup
            .string()
            .nullable()
            .url("有効なURLを入力してください")
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
        resolver: yupResolver(schema) as Resolver<CategoryFormData>,
        defaultValues: {
            name: category?.name ?? '',
            status: category?.status ?? 'ACTIVE',
            description: category?.description ?? '',
            imageUrl: category?.imageUrl ?? null,
        }
    });
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
        ></Dialog>
    )
}
export default CategoryForm;