import { Box, Button, Divider, Grid, Paper, Stack, Typography, useTheme } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { UserData } from "../types/user";
import { tokens } from "../../../shared/theme";
import { ROLES } from "../../../constants/role";


type UserShowProps = {
    user: UserData | null;
    onBack?: () => void;
    onEdit?: () => void;
    onDelete?: (user: UserData) => void;
}
const UserShow = ({
    user,
    onBack,
    onEdit,
    onDelete
}: UserShowProps) => {


    const theme = useTheme();
    const colors = tokens(theme.palette.mode)

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
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[500] }}>
                        <Typography variant="overline">ID</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>{user.userId}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[500] }}>
                        <Typography variant="overline">名前</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>{user.name}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[500] }}>
                        <Typography variant="overline">メールアドレス</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>{user.email}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[500] }}>
                        <Typography variant="overline">電話番号</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>{user.phoneNumber}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ px: 2, py: 1, backgroundColor: colors.primary[500] }}>
                        <Typography variant="overline">役割</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>{ROLES[user.role].label}</Typography>
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