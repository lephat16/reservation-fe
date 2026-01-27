import { DialogContent, useTheme } from "@mui/material";
import { tokens } from "../../theme";

interface StyledDialogContentProps {
    children: React.ReactNode;
    dividers?: boolean;
}

export const StyledDialogContent: React.FC<StyledDialogContentProps> = ({ children, dividers = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const dialogTextFieldStyles = {
        "& .MuiTextField-root": {
            marginBottom: 2,
            "& .MuiInputLabel-root": { color: colors.grey[100] },
            "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.primary[200] },
                "&:hover fieldset": { borderColor: colors.primary[300] },
                "&.Mui-focused fieldset": { borderColor: colors.primary[200] },
            },
        },
    };

    return (
        <DialogContent dividers={dividers} sx={dialogTextFieldStyles}>
            {children}
        </DialogContent>
    );
};
