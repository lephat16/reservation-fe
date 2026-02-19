import { Box, IconButton, Skeleton, Tooltip, useTheme } from "@mui/material";
import { useAllUsers } from "./hooks/useAllUsers";
import Header from "../../shared/components/layout/Header";
import { useScreen } from "../../shared/hooks/ScreenContext";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import ErrorState from "../../shared/components/messages/ErrorState";
import { tokens } from "../../shared/theme";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useState } from "react";
import type { UserData, UserRequestData } from "./types/user";
import { useDeleteUser } from "./hooks/useDeleteUser";
import UserHeader from "./compoments/UserHeader";
import UsersTable from "./compoments/UsersTable";
import UserShow from "./compoments/UserShow";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "./api/userAPI";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import UserForm from "./compoments/UserForm";


const UsersPage = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { isSM, isMD } = useScreen();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [mode, setMode] = useState<"list" | "detail" | "edit" | "create">("list");

  const queryClient = useQueryClient();
  const handleDeleteSuccess = () => {
    setOpenDeleteConfirm(false);
    setSelectedUser(null);
  };

  const { isLoading, error, data } = useAllUsers();
  const deleteMutation = useDeleteUser(handleDeleteSuccess, showSnackbar);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UserRequestData }) => {
      return userAPI.updateUserById(id, data);
    },
    onSuccess: (response) => {
      showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserRequestData) => {
      return userAPI.createUserByAdmin(data);
    },
    onSuccess: (response) => {
      showSnackbar(response.message || SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
    }
  })

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
                setMode("create");
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
          <Box mt={1}>
            <UserHeader
              user={selectedUser}
              mode={mode}
              onNavigate={(targetMode) => {
                if (targetMode === "list") {
                  setSelectedUser(null);
                  setMode("list");
                }
                if (targetMode === "detail") {
                  setMode("detail");
                }
              }}
            />
            <Box mt={1} display="flex" flexDirection={{ xs: 'column', xl: 'row' }} gap={4} >


              {
                mode === "list" &&
                <UsersTable
                  users={data ?? []}
                  isMD={isMD}
                  colors={colors}
                  theme={theme}
                  onSelectUser={(user) => {
                    setSelectedUser(user);
                    setMode("detail");
                  }}

                // onDelete={() =>
                //   selectedUser &&
                //   deleteMutation.mutate(selectedUser?.id || 0)}
                />
              }
              {
                (mode === "edit" || mode === "create") &&
                <UserForm
                  user={selectedUser}
                  mode={mode}
                  onBack={() => {
                    mode === "edit" ? setMode("detail") : setMode("list")
                  }}
                  onSubmit={(data) => {
                    if (mode === "edit") {
                      if (!selectedUser) return;
                      updateMutation.mutate({
                        id: selectedUser.id,
                        data
                      });
                    } else if (mode === "create") {
                      createMutation.mutate(data);
                    }
                    setMode("list");
                  }}
                />
              }

              {
                mode === "detail" &&
                <UserShow
                  user={selectedUser}
                  onBack={() => {
                    setSelectedUser(null);
                    setMode("list");
                  }}
                  onEdit={() => setMode("edit")}
                // onDelete={() =>
                //   selectedUser &&
                //   deleteMutation.mutate(selectedUser?.id || 0)}
                />
              }
            </Box>
          </Box>
        )}
      </Box>

    </Box>
  )
}

export default UsersPage