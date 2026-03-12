import { Box, Button, Chip, Divider, Grid, Paper, Stack, Typography, useTheme } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { UserData, UserSession } from "../types/user";
import { tokens } from "../../../shared/theme";
import { ROLES } from "../../../constants/role";
import { SESSION_STATUS } from "../../../constants/status";

/**
 * ユーザー詳細情報表示コンポーネント。
 * ユーザーの基本情報（ID・名前・メール・電話番号・役割）を表示し、
 * セッション管理および編集・削除操作を提供する。
 *
 * @param props ユーザー詳細表示のプロパティ
 * @returns ユーザー詳細画面のJSX要素
 */

type UserShowProps = {
    user: UserData | null;
    onBack?: () => void;
    onEdit?: () => void;
    onDelete?: (user: UserData) => void;
    session?: UserSession[];
    onShowSessionTable?: () => void;
}
const UserShow = ({
    user,
    onBack,
    onEdit,
    onDelete,
    session,
    onShowSessionTable
}: UserShowProps) => {


    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    if (!user) {
        return (
            <Paper sx={{ p: 2, minWidth: 300 }}>
                ユーザーを選択してください
            </Paper>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[900] }}>
                        <Typography sx={{ fontSize: { sm: "1.2rem" } }}>ID</Typography>
                        <Typography sx={{ mb: 1, fontSize: { sm: "1.2rem" } }}>{user.userId}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[900] }}>
                        <Typography sx={{ fontSize: { sm: "1.2rem" } }}>名前</Typography>
                        <Typography sx={{ mb: 1, fontSize: { sm: "1.2rem" } }}>{user.name}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[900] }}>
                        <Typography sx={{ fontSize: { sm: "1.2rem" } }}>メールアドレス</Typography>
                        <Typography sx={{ mb: 1, fontSize: { sm: "1.2rem" } }}>{user.email}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[900] }}>
                        <Typography sx={{ fontSize: { sm: "1.2rem" } }}>電話番号</Typography>
                        <Typography sx={{ mb: 1, fontSize: { sm: "1.2rem" } }}>{user.phoneNumber}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[900] }}>
                        <Typography sx={{ fontSize: { sm: "1.2rem" } }}>役割</Typography>
                        <Typography sx={{ mb: 1, fontSize: { sm: "1.2rem" } }}>{ROLES[user.role].label}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                        sx={{
                            px: 2,
                            py: 1,
                            backgroundColor: colors.primary[900],
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: colors.primary[700],
                            },
                        }}
                        onClick={onShowSessionTable}
                    >
                        <Typography sx={{ fontSize: { sm: "1.2rem" } }}>セッション管理</Typography>
                        <Typography sx={{ mb: 1, fontSize: { sm: "1.2rem" } }} display="flex" alignItems="center">
                            {session?.filter(ss => ss.status === SESSION_STATUS.ACTIVE.value).length ?? 0}
                            <Chip
                                label={SESSION_STATUS.ACTIVE.label}
                                color={SESSION_STATUS.ACTIVE.color}
                                size="small"
                                sx={{ height: 16, ml: 1 }}
                            />
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                >
                    Back
                </Button>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete?.(user)}
                    >
                        Delete
                    </Button>
                </Stack>
            </Stack>
        </Box>
    )
}

export default UserShow