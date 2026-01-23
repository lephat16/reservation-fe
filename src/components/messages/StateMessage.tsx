import { Box, CircularProgress, Typography } from "@mui/material";


interface StateProps {
    isLoading?: boolean;
    error?: boolean;
    loadingMessage?: string;
    errorMessage?: string;
}

const StateMessage = ({ isLoading, error, loadingMessage, errorMessage }: StateProps) => {
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
                <Typography variant="h6" sx={{ marginLeft: 2 }}>
                    {loadingMessage || "読み込み中..."} 
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="h6" color="error">
                    {errorMessage || "データの取得に失敗しました"} 
                </Typography>
            </Box>
        );
    }

    return null; 
};

export default StateMessage;
