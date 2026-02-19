import { Box, IconButton, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, useTheme } from "@mui/material";
import { useAllUsers } from "./hooks/useAllUsers";
import Header from "../../shared/components/layout/Header";
import { useScreen } from "../../shared/hooks/ScreenContext";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import ErrorState from "../../shared/components/messages/ErrorState";
import { styledTable } from "../../shared/styles/StyleTable";
import { tokens } from "../../shared/theme";
import { ROLES } from "../../constants/role";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { blue, red } from "@mui/material/colors";
import UserForm from "./compoments/UserForm";
const UsersPage = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { isSM, isMD } = useScreen();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const { isLoading, error, data } = useAllUsers();

  return (
    <Box m={3}>
      <Box display="flex" justifyContent="space-between">
        {isLoading ? (
          <Skeleton variant="text" width="80%" height={40} />
        ) : (
          !isSM && <Header
            title="ユーザー覧"
            subtitle="ユーザー情報の一覧表示"
          />
        )}
        <Box mt={4}>
          <Tooltip title="追加">
            <IconButton
              color="success"
              aria-label="追加"
              onClick={() => {

              }}>
              <PersonAddIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box mt={3} height="75vh">
        {/* メッセージ表示 */}
        <CustomSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={closeSnackbar}
        />

        {/* エラー表示 */}
        {(error) && (
          <ErrorState />
        )}
        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <Box mt={1} display="flex" flexDirection={{ xs: 'column', xl: 'row' }} gap={4} >
            <TableContainer component={Paper} sx={{ height: "100%", minWidth: { xs: 308, md: 600 } }}>
              <Table
                sx={{
                  tableLayout: "fixed",
                  ...styledTable(colors),
                }}
              >
                <colgroup>
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "15%" }} />
                  {!isMD && <col style={{ width: "25%" }} />}
                  {!isMD && <col style={{ width: "15%" }} />}
                  <col style={{ width: "15%" }} />
                  {!isMD && <col style={{ width: "15%" }} />}
                  <col style={{ width: "15%" }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell>ユーザーID</TableCell>
                    <TableCell>名前</TableCell>
                    {!isMD && <TableCell>メール</TableCell>}
                    {!isMD && <TableCell>電話番号</TableCell>}
                    <TableCell>役割</TableCell>
                    {!isMD && <TableCell>作成日時</TableCell>}
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.map((user) => (
                    <TableRow key={user.id}>
                      {!isMD && <TableCell>{user.userId}</TableCell>}
                      <TableCell>{user.name}</TableCell>
                      {!isMD && <TableCell>{user.email}</TableCell>}
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{ROLES[user.role].label}</TableCell>
                      {!isMD && <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>}
                      <TableCell>
                        <Stack direction="row">
                          <Tooltip title="詳細">
                            <IconButton
                              aria-label="see-more"
                              size="small"
                              sx={{
                                '&:hover': {
                                  color: theme.alpha(blue[800], 1),
                                },
                              }}
                              onClick={() => { }}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton
                              aria-label="delete"
                              size="small"
                              sx={{
                                '&:hover': {
                                  color: theme.alpha(red[800], 1),
                                },
                              }}
                              onClick={() => { }}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <UserForm />
          </Box>
        )}
      </Box>

    </Box>
  )
}

export default UsersPage