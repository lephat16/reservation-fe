import {  Card, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, Typography, useTheme } from "@mui/material";
import type { LoginHistories } from "../types/user";
import { styledTable } from "../../../shared/styles/StyleTable";
import { tokens } from "../../../shared/theme";
import { useState } from "react";

type LoginHistoriesCardProps = {
  loginHistories: LoginHistories[];
  isLoading?: boolean;
  error?: unknown;
}
const LoginHistoriesCard = ({ loginHistories, isLoading, error }: LoginHistoriesCardProps) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (isLoading) return <Typography>読み込み中...</Typography>;
  if (error) return <Typography>エラーが発生しました</Typography>;
  if (!loginHistories || loginHistories.length === 0)
    return <Typography>ログイン履歴がありません</Typography>;
  return (

    <Card
      sx={{
        background: colors.primary[400],
        mt: 2
      }}
    >
      <Typography
        className="title"
        variant="h4"
        align="center"
        fontWeight="bold"
        sx={{ color: colors.grey[100], mb: 2, pt:3 }}
      >
        ログイン履歴
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '75vh',
          overflowY: 'auto',
        }}>
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
            {loginHistories
              .slice(
                page * rowsPerPage,
                rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : loginHistories.length
              )
              .map((history) => (
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
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10,]}
                colSpan={5}
                count={loginHistories.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  },
                }}
                onPageChange={(_, newPage) => { setPage(newPage) }}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}

              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default LoginHistoriesCard