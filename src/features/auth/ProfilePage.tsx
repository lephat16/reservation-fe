import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import type { ChangePasswordRequest, LoginHistories, UserData } from "../user/types/user";
import { Box, Tab, Tabs, useTheme } from "@mui/material";
import ProfileCard from "../user/components/ProfileCard";
import { useEffect, useState } from "react";
import { tokens } from "../../shared/theme";
import type { RootState } from "./store";
import { useSelector, } from "react-redux";
import ChangePasswordCard from "../user/components/ChangePasswordCard";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import GppGoodIcon from '@mui/icons-material/GppGood';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import HistoryIcon from '@mui/icons-material/History';
import LoginHistoriesCard from "../user/components/LoginHistoryCard";
import { userAPI } from "../user/api/userAPI";
/**
 * プロフィールページ
 *
 * ユーザーの個人情報表示・更新、パスワード変更、
 * ログイン履歴の確認を行うページコンポーネント。
 */

type UpdateUserPayload = {
    id: number;
    data: Partial<UserData>;
};

const ProfilePage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const queryClient = useQueryClient(); // React Queryのクライアント取得
    const { showSnackbar } = useSnackbar(); // スナックバー管理用カスタムフック

    // ユーザー情報用のローカルステート
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const { user } = useSelector((state: RootState) => state.auth);

    // タブの管理
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Reduxのユーザー情報をローカルステートに反映
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhoneNumber(user.phoneNumber);
        }
    }, [user]);

    // ログイン履歴の取得
    const { isLoading, error, data } = useQuery<LoginHistories[]>({
        queryKey: ["login-histories"],
        queryFn: async () => {
            const resloginHistories = await userAPI.getLoginHistories();
            return resloginHistories.data
        },
        enabled: !!user // ユーザーがいる場合のみ実行

    });

    // ユーザー情報更新用ミューテーション
    const updateUserMutation = useMutation({
        mutationFn: (payload: UpdateUserPayload) =>
            userAPI.updateUserById(payload.id, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] }); // プロフィール情報を再取得
            showSnackbar("プロフィールが更新されました", "success");
        },
        onError: () => {
            showSnackbar("プロフィールの更新に失敗しました", "error");
        },
    });

    // パスワード変更用ミューテーション
    const changePasswordMutation = useMutation({
        mutationFn: async (data: ChangePasswordRequest) => {
            return userAPI.changePassword(Number(user?.id), data)
        },

        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.CHANGE_PASSWORD_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["profile"] });

        },

        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CHANGE_PASSWORD_SUCCESS, "error");
        },
    });

    // プロフィール保存処理
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
        <Box mt={3} height="75vh" width={{xs:"100%", lg: 900, md: 700 }} justifySelf="center">

            {/* ページタイトルとタブ */}
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
                        <Tab icon={<HistoryIcon />} label="ロギング履歴" />
                    </Tabs>

                    {/* タブごとの表示内容 */}
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
                            {tabValue === 2 && (
                                <LoginHistoriesCard
                                    loginHistories={data || []}
                                    isLoading={isLoading}
                                    error={error}
                                />
                            )}

                        </>
                    )}
                </Box>
            </Box>
        </Box>


    )
}

export default ProfilePage;


