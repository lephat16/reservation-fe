import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import type { UserData } from "./types/auth";
import { Box, Container, Skeleton, Typography, useTheme } from "@mui/material";
import ProfileCard from "./components/ProfileCard";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import { useEffect, useState } from "react";
import { tokens } from "../../shared/theme";
import ErrorState from "../../shared/components/messages/ErrorState";
import { authAPI } from "./api/authAPI";

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

    const {
        data: profileData,
        isLoading: profileLoading,
        error: profileError
    } = useQuery<UserData>({
        queryKey: ["profile"],
        queryFn: async () => {
            const profileRes = await authAPI.getLoggedInUser();
            return profileRes.data;
        }
    });



    useEffect(() => {
        if (profileData) {
            setName(profileData.name);
            setEmail(profileData.email);
            setPhoneNumber(profileData.phoneNumber);
        }
    }, [profileData]);

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
        if (!profileData) return;

        updateUserMutation.mutate({
            id: Number(profileData.id!),
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

            {/* エラー表示 */}
            {(profileError) && (
                <ErrorState />
            )}
            {profileLoading ? (
                <>
                    <Skeleton animation="wave" variant="circular" width={40} height={40} />
                    <Skeleton
                        animation="wave"
                        height={10}
                        width="80%"
                        style={{ marginBottom: 6 }}
                    />
                </>
            ) : (
                <Box
                    sx={{
                        position: 'sticky',
                        top: { sm: -100, md: -110 },
                        bgcolor: 'background.body',
                        zIndex: 9995,
                    }}
                >
                    <Box sx={{ px: { xs: 2, md: 6 } }}>
                        {profileData && (
                            <ProfileCard
                                name={name}
                                userId={profileData.userId || ""}
                                email={email}
                                role={profileData.role}
                                phoneNumber={phoneNumber}
                                onChangeName={setName}
                                onChangeEmail={setEmail}
                                onChangePhoneNumber={setPhoneNumber}
                                onSave={handleSave}
                            />
                        )}
                    </Box>
                </Box>
            )}
        </Container>


    )
}

export default ProfilePage;


