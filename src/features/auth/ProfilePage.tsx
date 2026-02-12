import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import type { UserData } from "./types/auth";
import { Box, Container, Typography, useTheme } from "@mui/material";
import ProfileCard from "./components/ProfileCard";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import { useEffect, useState } from "react";
import { tokens } from "../../shared/theme";
import { authAPI } from "./api/authAPI";
import type { RootState } from "./store";
import { useSelector, } from "react-redux";

type UpdateUserPayload = {
    id: number;
    data: Partial<UserData>;
};

const ProfilePage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar(); // スナックバー管理用カスタムフック
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhoneNumber(user.phoneNumber);
        }
    }, [user]);

    const updateUserMutation = useMutation({
        mutationFn: (payload: UpdateUserPayload) =>
            authAPI.updateUserById(payload.id, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            showSnackbar("プロフィールが更新されました", "success");
        },
        onError: () => {
            showSnackbar("プロフィールの更新に失敗しました", "error");
        },
    })
    const handleSave = async () => {
        if (!user) return;

        updateUserMutation.mutate({
            id: Number(user.id!),
            data: {
                name,
                email,
                phoneNumber
            },
        });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* メッセージ表示 */}
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            {/* ページタイトル */}
            <Typography
                className="title"
                variant="h4"
                align="center"
                fontWeight="bold"
                sx={{ color: colors.grey[100], mb: 2 }}
            >
                個人情報
            </Typography>

            <Box
                sx={{
                    position: 'sticky',
                    top: { sm: -100, md: -110 },
                    bgcolor: 'background.body',
                    zIndex: 9995,
                }}
            >
                <Box sx={{ px: { xs: 2, md: 6 } }}>
                    {user && (
                        <ProfileCard
                            name={name}
                            userId={user.userId || ""}
                            email={email}
                            role={user.role}
                            phoneNumber={phoneNumber}
                            onChangeName={setName}
                            onChangeEmail={setEmail}
                            onChangePhoneNumber={setPhoneNumber}
                            onSave={handleSave}
                        />
                    )}
                </Box>
            </Box>

        </Container>


    )
}

export default ProfilePage;


