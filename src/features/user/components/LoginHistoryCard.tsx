import { Card, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import type { LoginHistories } from "../types/user";
import { styledTable } from "../../../shared/styles/StyleTable";
import { tokens } from "../../../shared/theme";
import { useState } from "react";
import { getCommonSlotProps } from "../../../shared/components/pagination/TablePaginationHelper";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import { LOGIN_STATUS } from "../../../constants/status";

/**
 * 商品詳細カードコンポーネント
 * 商品の基本情報、ステータス、カテゴリーを表示する。
 *
 * @param product 商品データ
 * @param openDeleteDialog 削除ダイアログを開くコールバック関数
 * @param openEditDialog 編集ダイアログを開くコールバック関数
 */

type LoginHistoriesCardProps = {
  loginHistories: LoginHistories[];
  isLoading?: boolean;
  error?: unknown;
}
const LoginHistoriesCard = ({ loginHistories, isLoading, error }: LoginHistoriesCardProps) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { isSM } = useScreen();  // 画面サイズ判定
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
        mt: 2,
        minHeight: 450
      }}
    >
      <Typography
        className="title"
        variant="h4"
        align="center"
        fontWeight="bold"
        sx={{ color: colors.grey[100], mb: 2, pt: 3 }}
      >
        ログイン履歴
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '75vh',
          overflowY: 'auto',
          minWidth: { xs: 308, md: 600 }
        }}>
        <Table
          stickyHeader
          sx={{
            tableLayout: "fixed",
            ...styledTable(colors, {
              rowHoverBg: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
            }),
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        >
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: isSM ? "20%" : "25%" }} />
            <col style={{ width: "35%" }} />
            <col style={{ width: isSM ? "25%" : "15%" }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>日時</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>デバイス</TableCell>
              <TableCell>状態</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {loginHistories
              .slice(
                page * rowsPerPage,
                rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : loginHistories.length
              )
              .map((history) => {
                const loginTime = new Date(history.loginTime);
                return (
                  <TableRow key={history.id}>
                    <TableCell>
                      <Tooltip title={loginTime.toLocaleString()}>
                        <span>{loginTime.toLocaleDateString()}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {history.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={history.device}>
                        <span>{history.device}</span>
                      </Tooltip>

                    </TableCell>
                    <TableCell>
                      <Chip
                        label={LOGIN_STATUS[history.status].label}
                        color={LOGIN_STATUS[history.status].color}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}

          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10,]}
                colSpan={4}
                count={loginHistories.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={getCommonSlotProps(isSM)}
                onPageChange={(_, newPage) => { setPage(newPage) }}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Card >
  )
}

export default LoginHistoriesCard