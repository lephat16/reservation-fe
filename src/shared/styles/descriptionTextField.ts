import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

export const descriptionTextField = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return {
    '& .MuiInputLabel-root': {
      color: colors.grey[100],
      fontWeight: 600
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: colors.grey[200],
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: colors.grey[600] },
      '&:hover fieldset': { borderColor: colors.grey[400] },
      '&.Mui-focused fieldset': { borderColor: colors.grey[200] },
    },
    '& .MuiOutlinedInput-input': {
      color: colors.grey[100],
    },
  };
};
