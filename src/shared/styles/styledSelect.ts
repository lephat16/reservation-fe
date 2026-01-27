import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

export const styledSelect = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return {
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.grey[600],
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.grey[400],
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.grey[200],
        },
    };
};
