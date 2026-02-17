import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import type { ChangePasswordRequest, UserData } from "./types/auth";
import { Box, Container, Tab, Tabs, useTheme } from "@mui/material";
import ProfileCard from "./components/ProfileCard";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import { useEffect, useState } from "react";
import { tokens } from "../../shared/theme";
import { authAPI } from "./api/authAPI";
import type { RootState } from "./store";
import { useSelector, } from "react-redux";
import ChangePasswordCard from "./components/ChangePasswordCard";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import GppGoodIcon from '@mui/icons-material/GppGood';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

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

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };
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
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: ChangePasswordRequest) => {
            return authAPI.changePassword(Number(user?.id), data)
        },

        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.CHANGE_PASSWORD_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["profile"] });

        },

        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CHANGE_PASSWORD_SUCCESS, "error");
        },
    });


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


            <Box
                sx={{
                    position: 'sticky',
                    top: { sm: -100, md: -110 },
                    bgcolor: 'background.body',
                }}
            >
                <Box sx={{ px: { xs: 2, md: 6 } }} color={colors.grey[100]}>
                    <Tabs
                        variant="fullWidth"
                        centered
                        value={tabValue}
                        indicatorColor="secondary"
                        textColor="inherit"
                        onChange={handleTabChange}
                        aria-label="icon tabs"

                    >
                        <Tab icon={<AccountBoxIcon />} label="個人情報" />
                        <Tab icon={<GppGoodIcon />} label="パスワード変更" />
                    </Tabs>
                    {user && (
                        <>

                            {tabValue === 0 && (
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
                            {tabValue === 1 && (
                                <ChangePasswordCard
                                    onSubmit={(request: ChangePasswordRequest) => {
                                        changePasswordMutation.mutate(request);
                                    }}
                                />
                            )}

                        </>
                    )}
                </Box>
            </Box>

        </Container>


    )
}

export default ProfilePage;


