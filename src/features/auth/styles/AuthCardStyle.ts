import { styled, alpha } from "@mui/material/styles";
import MuiCard from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import { blue, blueGrey } from "@mui/material/colors";

export const AuthCard = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: alpha(blueGrey[900], 0.5),
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",

    [theme.breakpoints.up("sm")]: {
        width: "450px",
    },

    ...theme.applyStyles("dark", {
        boxShadow:
            "hsla(226, 32%, 31%, 0.50) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
}));

export const AuthTextField = styled(TextField)(({ theme }) => ({
    marginTop: theme.spacing(0.2),

    "& .MuiOutlinedInput-root": {
        transition: "all 120ms ease-in",

        "&.Mui-focused": {
            outline: `3px solid ${alpha(blue[700], 0.5)}`,
        },

        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
        },
    },
}));
