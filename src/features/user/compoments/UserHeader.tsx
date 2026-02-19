import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { UserData } from "../types/user";
import type { ReactNode } from "react";

type UserHeaderProps = {
    user: UserData | null;
    mode?: "list" | "detail" | "edit" | "create";
    onNavigate?: (mode: "list" | "detail") => void;
};

const UserHeader = ({ user, mode = "list", onNavigate }: UserHeaderProps) => {

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
    if ((mode === "detail" || mode === "edit") && user) {
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
    return (
        <Box mb={3}>
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
            >
                {breadcrumbs}
            </Breadcrumbs>
        </Box>
    );
};

export default UserHeader;
