import { Box, Button, Chip, Divider, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, useTheme } from "@mui/material";
import type { UserSession } from "../types/user";
import { styledTable } from "../../../shared/styles/StyleTable";
import { tokens } from "../../../shared/theme";
import LogoutIcon from '@mui/icons-material/Logout';
import { SESSION_STATUS } from "../../../constants/status";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type UserSessionProps = {
    onBack?: () => void;
    session?: UserSession[];
    onRevokeSession?: (sessionId: number) => void;
    onRevokeAll?: () => void;
    isLoading: boolean;
    error: Error | null;
}

const SessionTable = ({
    onBack,
    session,
    onRevokeSession,
    isLoading,
    error
}: UserSessionProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box sx={{ height: "50vh", width: "100%" }}>
            <TableContainer component={Paper} sx={{ height: "100%", mt: 0, backgroundColor: "inherit" }} >
                <Table
                    stickyHeader
                    sx={{
                        ...styledTable(colors)
                    }}
                >
                    <colgroup>
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "20%" }} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell>デバイス</TableCell>
                            <TableCell>IPアドレス</TableCell>
                            <TableCell>作成日時</TableCell>
                            <TableCell>有効期限</TableCell>
                            <TableCell>ステータス</TableCell>
                            <TableCell align="center">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    読み込み中...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: 'red' }}>
                                    セッションの取得に失敗しました
                                </TableCell>
                            </TableRow>
                        ) : session?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    セッションはありません
                                </TableCell>
                            </TableRow>
                        ) : (
                            session?.map(ss => {
                                const createAt = new Date(ss.createdAt);
                                const expiry = new Date(ss.expiry);
                                return (
                                    <TableRow key={ss.id}>
                                        <TableCell>{ss.device}</TableCell>
                                        <TableCell>{ss.ipAddress}</TableCell>
                                        <TableCell>
                                            <Tooltip title={createAt.toLocaleString()}>
                                                <span>{createAt.toLocaleDateString()}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={expiry.toLocaleString()}>
                                                <span>{expiry.toLocaleDateString()}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={SESSION_STATUS[ss.status].label}
                                                color={SESSION_STATUS[ss.status].color}
                                                size="small"
                                                sx={{ minWidth: 70 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" justifyContent="center">
                                                <Tooltip title={ss.currentSession ? "現在のセッションです" : (ss.revoked ? "無効化されたセッション" : "無効化")}>
                                                    <span>
                                                        <IconButton
                                                            aria-label="info"
                                                            size="medium"
                                                            sx={{
                                                                '&:hover': {
                                                                    color: colors.blueAccent[500],
                                                                },
                                                            }}
                                                            onClick={() => {
                                                                if (onRevokeSession && ss.id != null) {
                                                                    onRevokeSession(ss.id)
                                                                }
                                                            }}
                                                            disabled={ss.currentSession || ss.revoked}
                                                        >
                                                            <LogoutIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Stack>

                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}

                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                >
                    Back
                </Button>
            </Stack>
        </Box>
    )
}

export default SessionTable