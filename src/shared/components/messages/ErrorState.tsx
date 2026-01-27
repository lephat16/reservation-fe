import { Alert } from "@mui/material";

interface ErrorStateProps {
  message?: string;
}

const ErrorState = ({ message = "データの取得に失敗しました" }: ErrorStateProps) => {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {message}
    </Alert>
  );
};

export default ErrorState;
