import { Avatar, Badge, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MenuIcon from '@mui/icons-material/Menu';
import React from "react";
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from "@mui/icons-material/Logout";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../features/auth/store/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../../../features/auth/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import notificationAPI from "../../api/notificationAPI";
import type { NotificationResponse, NotificationType } from "../../types/shared";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from "../../hooks/SnackbarContext";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { getErrorMessage } from "../../utils/errorHandler";

type TopbarProps = {
  onSidebarClick?: () => void;
};

const formatNotificationTime = (createdAt: string | Date) => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffHour >= 24) {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else if (diffHour >= 1) {
    return `${diffHour}時間前`;
  } else if (diffMin >= 1) {
    return `${diffMin}分前`;
  } else {
    return "たった今";
  }
};
const today = new Date();
today.setHours(0, 0, 0, 0);

const weekStart = new Date();
weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
weekStart.setHours(0, 0, 0, 0);

const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);


const Topbar = ({ onSidebarClick }: TopbarProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  // スナックバー表示用カスタムフック
  const { showSnackbar } = useSnackbar();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // React Queryのクライアント取得
  const { user } = useSelector((state: RootState) => state.auth);

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [anchorNotif, setAnchorNotif] = useState<null | HTMLElement>(null);
  const [anchorAcount, setAnchorAcount] = useState<null | HTMLElement>(null);
  const openAnchorAcount = Boolean(anchorAcount);
  const openAnchorNotif = Boolean(anchorNotif);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "ORDER":
        return <LocalShippingIcon fontSize="small" color="warning" />
      case "STOCK":
        return <WidgetsIcon fontSize="small" />;
      case "TASK":
        return <AssignmentIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const handleAcountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorAcount(event.currentTarget);
  };
  const handleAcountClose = () => {
    setAnchorAcount(null);
  };

  const { data: notifications } = useQuery<NotificationResponse[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user?.id) return [];
      const resNotifications = await notificationAPI.getNotificationsForUser(user?.id);
      return resNotifications.data
    },
    enabled: !!user // ユーザーがいる場合のみ実行
  });

  const groupedNotifications = [
    { label: "今日", items: notifications?.filter(n => new Date(n.createdAt) >= today) ?? [] },
    {
      label: "今週", items: notifications?.filter(n => {
        const created = new Date(n.createdAt);
        return created >= weekStart && created < today;
      }) ?? []
    },
    {
      label: "今月", items: notifications?.filter(n => {
        const created = new Date(n.createdAt);
        return created >= monthStart && created < weekStart;
      }) ?? []
    },
  ];

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["unread-count"],
    queryFn: async () => {
      if (!user?.id) return 0;
      const resunreadCount = await notificationAPI.getUnreadCount(user?.id);
      return resunreadCount.data
    },
    enabled: !!user // ユーザーがいる場合のみ実行
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => notificationAPI.deleteNotification(id),
    onSuccess: (response) => {
      showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: unknown) => {
      showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!user?.id) return;
      return notificationAPI.markReadAllNotification(userId)
    },
    onSuccess: () => {
      showSnackbar(SNACKBAR_MESSAGES.NOTIFICATION_MESSAGES.READ_SUCCESS, "success");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
    onError: (error: unknown) => {
      showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.NOTIFICATION_MESSAGES.READ_FAILED, "error");
    }
  })

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorNotif(event.currentTarget);
  };
  const handleNotifClose = () => {
    setAnchorNotif(null);
  };

  const handleNotificationClick = async (notif: NotificationResponse) => {
    try {
      await notificationAPI.markAsRead(notif.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });

      if (notif.link) {
        navigate(notif.link);
      }

    } catch (err) {
      console.error("通知の更新に失敗しました", err);
    }
  };

  const notificationsLabel = (count: number) => {
    if (count === 0) {
      return '通知はありません';
    }
    if (count > 99) {
      return '通知99件以上';
    }
    return `通知 ${unreadCount} 件`;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      p={1}
      marginLeft="auto"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* ICONS */}
      <Box display="flex">
        <IconButton
          onClick={colorMode.toggleColorMode}
          aria-label={theme.palette.mode === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
        >
          {theme.palette.mode === "dark" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          onClick={handleNotifClick}
          size="small"
          aria-controls={openAnchorNotif ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openAnchorNotif ? 'true' : undefined}
          aria-label={notificationsLabel(unreadCount)}
        >
          <Badge badgeContent={unreadCount} color="secondary">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <IconButton
          onClick={handleAcountClick}
          size="small"
          aria-controls={openAnchorAcount ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openAnchorAcount ? 'true' : undefined}
        >
          <PersonOutlinedIcon />
        </IconButton>
        <IconButton
          onClick={onSidebarClick}
          sx={{ display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorAcount}
        id="account-menu"
        open={openAnchorAcount}
        onClose={handleAcountClose}
        onClick={handleAcountClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              backgroundColor: colors.primary[900],
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 4,
                width: 10,
                height: 10,
                bgcolor: colors.primary[900],
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Avatar sx={{ bgcolor: colors.blueAccent[500] }}>
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontSize={14}>{user?.email}</Typography>
            <Typography fontSize={12} color={colors.grey[200]}>
              {user?.role}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => navigate("/profile")} selected={isActive("/profile")}>
          <Avatar />マイアカウント
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleAcountClose}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          アカウントを追加
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          ログアウト
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorNotif}
        id="notification-menu"
        open={openAnchorNotif}
        onClose={handleNotifClose}
        onClick={handleNotifClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              backgroundColor: colors.primary[900],
              overflow: 'visible',
              maxWidth: 360,
              minWidth: 250,
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              position: "relative",
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 4,
                width: 10,
                height: 10,
                bgcolor: colors.primary[900],
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${colors.grey[800]}`
          }}
        >
          <Typography px={2} fontSize={20} fontWeight="bold" color={colors.blueAccent[500]}>
            通知
          </Typography>
          <Typography
            fontSize={12}
            px={2}
            sx={{
              cursor: "pointer",
              color: colors.blueAccent[300],
              "&:hover": { textDecoration: "underline" }
            }}
            onClick={() => markAllReadMutation.mutate(user?.id || 0)}
          >
            すべて既読にする
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {notifications?.length === 0 ? (
            <MenuItem>通知はありません</MenuItem>
          ) : (
            groupedNotifications.map(group => (
              group.items.length > 0 && (
                <Box key={group.label}>
                  <Typography px={2} py={1} fontSize={12} color={colors.grey[400]}>
                    {group.label}
                  </Typography>

                  {group.items.map((notif, index) => (
                    <MenuItem
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        backgroundColor: notif.readed ? 'transparent' : colors.blueAccent[800],
                        '&:hover': {
                          backgroundColor: notif.readed ? colors.primary[700] : colors.blueAccent[700],
                          '.delete-btn': { display: 'flex' }
                        },
                        borderBottom: index < group.items.length - 1 ? `1px solid ${colors.grey[800]}` : 'none',
                        position: "relative",
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notif.type)}
                      </ListItemIcon>

                      <Box>
                        <Typography
                          fontSize={14}
                          fontWeight={notif.readed ? 'normal' : 'bold'}
                          color={colors.grey[100]}
                        >
                          {notif.title}
                        </Typography>
                        <Typography fontSize={12} color={colors.grey[200]}>
                          {notif.message}
                        </Typography>
                        <Typography fontSize={10} color={colors.grey[400]}>
                          {formatNotificationTime(notif.createdAt)}
                        </Typography>
                      </Box>

                      <IconButton
                        className="delete-btn"
                        size="small"
                        sx={{
                          display: 'none',
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(notif.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </MenuItem>
                  ))}
                </Box>
              )
            ))
          )}
        </Box>
      </Menu>
    </Box>
  );
};

export default Topbar;