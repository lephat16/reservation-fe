import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import type { LoginHistories } from "../types/auth";
import { styledTable } from "../../../shared/styles/StyleTable";
import { tokens } from "../../../shared/theme";

type LoginHistoriesCardProps = {
  loginHistories: LoginHistories[];
  isLoading?: boolean;
  error?: unknown;
}
const LoginHistoriesCard = ({ loginHistories, isLoading, error }: LoginHistoriesCardProps) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (isLoading) return <Typography>読み込み中...</Typography>;
  if (error) return <Typography>エラーが発生しました</Typography>;
  if (!loginHistories || loginHistories.length === 0)
    return <Typography>ログイン履歴がありません</Typography>;
  return (

    <Box mt={2}>
      
      <TableContainer component={Paper} sx={{ height: "100%" }}>
        <Table
          stickyHeader
          sx={{
            ...styledTable(colors)
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>日時</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>デバイス</TableCell>
              <TableCell>状態</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loginHistories.map((history) => (
              <TableRow key={history.id}>
                <TableCell>
                  {history.loginTime}
                </TableCell>
                <TableCell>
                  {history.ipAddress}
                </TableCell>
                <TableCell>
                  {history.userAgent}
                </TableCell>
                <TableCell>
                  {history.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default LoginHistoriesCard