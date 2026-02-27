import { Breadcrumbs, Link, Typography, Box, Tooltip, IconButton } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { UserData } from "../types/user";
import type { ReactNode } from "react";
import ReplyIcon from '@mui/icons-material/Reply';


type UserHeaderProps = {
    user: UserData | null;
    mode?: "list" | "detail" | "edit" | "create" | "showSessions";
    onNavigate?: (mode: "list" | "detail") => void;
    onRevokeAll: () => void;
};

const UserHeader = ({ user, mode = "list", onNavigate, onRevokeAll }: UserHeaderProps) => {

    const handleNavigate = (target: "list" | "detail") => {
        onNavigate?.(target);
    };

    const breadcrumbs: ReactNode[] = [];
    breadcrumbs.push(
        <Link
            key="users"
            underline="hover"
            color={mode !== "list" ? "inherit" : "text.primary"}
            sx={{ cursor: "pointer" }}
            onClick={() => handleNavigate("list")}
        >
            ユーザー
        </Link>
    );
    if (mode === "create") {
        breadcrumbs.push(
            <Typography color="text.primary">
                作成
            </Typography>
        )
    }
    if ((mode === "detail" || mode === "edit" || mode === 'showSessions') && user) {
        breadcrumbs.push(
            <Link
                underline="hover"
                sx={{ cursor: "pointer" }}
                onClick={() => handleNavigate("detail")}
                color={mode === "edit" ? "inherit" : "text.primary"}>
                {user.userId}
            </Link>
        )
    }
    if (mode === "edit") {
        breadcrumbs.push(
            <Typography key="edit" sx={{ color: "text.primary" }}>
                編集
            </Typography>
        );
    }
    if (mode === "showSessions") {
        breadcrumbs.push(
            <Typography key="edit" sx={{ color: "text.primary" }}>
                セッション
            </Typography>
        );
    }
    return (
        <Box display="flex" justifyContent="space-between">
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ alignContent: "center", lineHeight: 2 }}
            >
                {breadcrumbs}
            </Breadcrumbs>
            {mode === "showSessions" &&
                <Tooltip title="すべてのセッションを無効化しました">
                    <IconButton
                        color="warning"
                        aria-label="すべてのセッションを無効化しました"
                        onClick={onRevokeAll}
                        size="small"
                    >
                        <ReplyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
        </Box>
    );
};

export default UserHeader;
