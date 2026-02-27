import { Box, IconButton, Skeleton, Tooltip, useTheme } from "@mui/material";
import { useAllUsers } from "./hooks/useAllUsers";
import Header from "../../shared/components/layout/Header";
import { useScreen } from "../../shared/hooks/ScreenContext";
import ErrorState from "../../shared/components/messages/ErrorState";
import { tokens } from "../../shared/theme";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useState } from "react";
import type { UserData, UserRequestData } from "./types/user";
import { useDeleteUser } from "./hooks/useDeleteUser";
import UserHeader from "./compoments/UserHeader";
import UsersTable from "./compoments/UsersTable";
import UserShow from "./compoments/UserShow";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "./api/userAPI";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import UserForm from "./compoments/UserForm";
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";
import { useUserSessions } from "./hooks/useUserSessions";
import SessionTable from "./compoments/SessionTable";


const UsersPage = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { isSM, isMD } = useScreen();
  const { showSnackbar } = useSnackbar();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [mode, setMode] = useState<"list" | "detail" | "edit" | "create" | "showSessions">("list");

  const queryClient = useQueryClient();
  const { confirmDelete } = useDialogs();
  const { isLoading, error, data } = useAllUsers();
  const { isLoading: isLoadingUserSession, error: errorUserSession, data: dataUserSession } = useUserSessions(selectedUser?.id);
  console.log(dataUserSession);
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

  const handleDeleteSuccess = () => {
    setSelectedUser(null);
    setMode("list");
  };
  const deleteMutation = useDeleteUser(handleDeleteSuccess, showSnackbar);
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
  });
  const revokeMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return userAPI.revokeSession(sessionId);
    },
    onSuccess: (response) => {
      showSnackbar(response.message || SNACKBAR_MESSAGES.SEND_REQUEST_SUCCESS, "success");
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: (error: unknown) => {
      showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.SEND_REQUEST_FAILED, "error");
    }
  });
  const revokeAllMutation = useMutation({
    mutationFn: async (userId: number) => {
      return userAPI.revokeAllSessions(userId);
    },
    onSuccess: (response) => {
      showSnackbar(response.message || SNACKBAR_MESSAGES.SEND_REQUEST_SUCCESS, "success");
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: (error: unknown) => {
      showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.SEND_REQUEST_FAILED, "error");
    }
  })
  const handleDelete = async (user: UserData) => {
    const ok = await confirmDelete(
      `ユーザー「${user.name}」を削除しますか？`
    );

    if (ok) {
      deleteMutation.mutate(user.id);
    }
  };


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
              onRevokeAll={() => {
                if (!selectedUser) return;
                revokeAllMutation.mutate(selectedUser?.id)
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

                  onDeleteUser={(user) =>
                    handleDelete(user)}
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
                  session={dataUserSession}
                  onBack={() => {
                    setSelectedUser(null);
                    setMode("list");
                  }}
                  onEdit={() => setMode("edit")}
                  onDelete={() =>
                    selectedUser &&
                    handleDelete(selectedUser)}
                  onShowSessionTable={() => setMode("showSessions")}
                />
              }
              {mode === "showSessions" &&
                <SessionTable
                  session={dataUserSession}
                  onBack={() => {
                    setMode("list")
                  }}
                  onRevokeSession={(sessionId: number) =>
                    revokeMutation.mutate(sessionId)}
                  isLoading={isLoadingUserSession}
                  error={errorUserSession}
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