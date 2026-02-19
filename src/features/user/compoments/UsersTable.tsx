import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import type { UserData } from "../types/user";
import { styledTable } from "../../../shared/styles/StyleTable";
import { ROLES } from "../../../constants/role";
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { blue, red } from "@mui/material/colors";

type UsersTableProps = {
    users: UserData[];
    isMD: boolean;
    colors: any;
    theme: any;
    onSelectUser: (user: UserData) => void;
    onDeleteUser?: (user: UserData) => void;
}
const UsersTable = ({
    users,
    isMD,
    colors,
    theme,
    onSelectUser,
    onDeleteUser,
}: UsersTableProps) => {
    return (
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
                    {users?.map((user) => (
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
                                            onClick={() => onSelectUser(user)}
                                        >
                                            <AccountBoxIcon fontSize="inherit" />
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
                                            onClick={() => onDeleteUser?.(user)}
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
    )
}

export default UsersTable