import { Box, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip, type Theme } from "@mui/material";
import type { UserData } from "../types/user";
import { styledTable } from "../../../shared/styles/StyleTable";
import { ROLES } from "../../../constants/role";
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { blue, red } from "@mui/material/colors";
import type { ColorTokens } from "../../../shared/types/shared";
import type { Order } from "../../products/AllProductsPage";
import { useMemo, useState } from "react";
import { TablePaginationActions } from "../../../shared/components/pagination/PaginationAction";
import { getCommonSlotProps } from "../../../shared/components/pagination/TablePaginationHelper";

/**
 * ユーザー一覧表示テーブルコンポーネント。
 * 画面サイズに応じて表示カラムを動的に切り替え、
 * 詳細表示および削除操作を提供する。
 *
 * @param props ユーザー一覧テーブルのプロパティ
 * @returns ユーザー一覧テーブルのJSX要素
 */

type UsersTableProps = {
    users: UserData[];
    isMD: boolean;
    isSM: boolean;
    isMdToLg?: boolean;
    colors: ColorTokens;
    theme: Theme;
    onSelectUser: (user: UserData) => void;
    onDeleteUser?: (user: UserData) => void;
}
const UsersTable = ({
    users,
    isMD,
    isSM,
    isMdToLg,
    colors,
    theme,
    onSelectUser,
    onDeleteUser,
}: UsersTableProps) => {

    // ページネーション
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    // ソート用state
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<'userId' | 'name' | 'email' | 'createdAt'>('createdAt');

    // ソート済みデータ
    const sortedUser = useMemo(() => {
        if (!users) return [];
        const getValue = (item: UserData) => {
            switch (orderBy) {
                case 'userId':
                    return Number(item.id);
                case 'name':
                    return item.name;
                case 'email':
                    return item.email;
                case 'createdAt':
                    return new Date(item.createdAt).getTime();
                default:
                    return 0;
            }
        }
        return [...users].sort((a, b) => {
            const valA = getValue(a);
            const valB = getValue(b);

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;

        });
    }, [users, order, orderBy]);

    // ページネーション用の空行数
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedUser.length - page * rowsPerPage);
    return (
        <Box sx={{ height: "59vh" }}>
            <Box>
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
                                <TableCell sortDirection={orderBy === 'userId' ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === 'userId'}
                                        direction={orderBy === 'userId' ? order : 'asc'}
                                        onClick={() => {
                                            const isAsc = orderBy === 'userId' && order === 'asc';
                                            setOrder(isAsc ? 'desc' : 'asc');
                                            setOrderBy('userId');
                                        }}
                                    >
                                        {isMdToLg ? 'ID' : 'ユーザーID'}
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === 'name' ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => {
                                            const isAsc = orderBy === 'name' && order === 'asc';
                                            setOrder(isAsc ? 'desc' : 'asc');
                                            setOrderBy('name');
                                        }}
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        名前
                                    </TableSortLabel>
                                </TableCell>
                                {!isMD && <TableCell sortDirection={orderBy === 'email' ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === 'email'}
                                        direction={orderBy === 'email' ? order : 'asc'}
                                        onClick={() => {
                                            const isAsc = orderBy === 'email' && order === 'asc';
                                            setOrder(isAsc ? 'desc' : 'asc');
                                            setOrderBy('email');
                                        }}
                                    >
                                        {isMdToLg ? 'メール' : 'メールアドレス'}
                                    </TableSortLabel>
                                </TableCell>}
                                {!isMD && <TableCell>{isMdToLg ? '電話' : '電話番号'}</TableCell>}
                                <TableCell>役割</TableCell>
                                {!isMD && <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === 'createdAt'}
                                        direction={orderBy === 'createdAt' ? order : 'asc'}
                                        onClick={() => {
                                            const isAsc = orderBy === 'createdAt' && order === 'asc';
                                            setOrder(isAsc ? 'desc' : 'asc');
                                            setOrderBy('createdAt');
                                        }}
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {isMdToLg ? '日時' : '作成日時'}
                                    </TableSortLabel>
                                </TableCell>}
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedUser.slice(
                                page * rowsPerPage,
                                rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : sortedUser.length
                            ).map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.userId}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    {!isMD && <TableCell>{user.email}</TableCell>}
                                    {!isMD && <TableCell>{user.phoneNumber}</TableCell>}
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
                            {/** データがない場合 */}
                            {sortedUser.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isMD ? 4 : 7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        該当するユーザーがありません
                                    </TableCell>
                                </TableRow>
                            )}
                            {/** 空行の埋め合わせ */}
                            {emptyRows > 0 && Array.from(Array(emptyRows)).map((_, index) => (
                                <TableRow key={`empty-${index}`} style={{ height: 47 }}>
                                    <TableCell colSpan={isMD ? 4 : 7} />
                                </TableRow>
                            ))}
                        </TableBody>
                        {/** ページネーション */}
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={([5, 10])}
                                    colSpan={isMD ? 4 : 7}
                                    count={sortedUser?.length || 0}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    slotProps={getCommonSlotProps(isSM)}
                                    onPageChange={(_, newPage) => setPage(newPage)}
                                    onRowsPerPageChange={(event) => {
                                        setRowsPerPage(parseInt(event.target.value, 10));
                                        setPage(0);
                                    }}
                                    ActionsComponent={TablePaginationActions}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    )
}

export default UsersTable