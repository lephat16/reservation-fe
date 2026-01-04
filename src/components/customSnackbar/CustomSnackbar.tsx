import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { type AlertColor } from "@mui/material/Alert";

interface CustomSnackbarProps {
    open: boolean;
    message: string;
    severity?: AlertColor;
    autoHideDuration?: number;
    onClose: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
    open,
    message,
    severity = "info",
    autoHideDuration = 3000,
    onClose,
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <MuiAlert
                elevation={6}
                variant="filled"
                severity={severity}
            >
                {message}
            </MuiAlert>
        </Snackbar>
    );
};

export default CustomSnackbar;