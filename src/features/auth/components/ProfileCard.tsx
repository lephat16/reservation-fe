import { Button, Card, FormControl, FormLabel, Input, Stack, Typography, useTheme } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/theme";

type ProfileCardProps = {
    name: string;
    userId: string;
    role?: string;
    email: string;
    phoneNumber?: string;
    onChangeName?: (value: string) => void;
    onChangeEmail?: (value: string) => void;
    onChangePhoneNumber?: (value: string) => void;
    onCancel?: () => void;
    onSave?: () => void;
};
const ProfileCard: React.FC<ProfileCardProps> = ({
    name,
    userId,
    role,
    email,
    phoneNumber,
    onChangeName,
    onChangeEmail,
    onChangePhoneNumber,

    onSave, }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    const handleEdit = () => setIsEditMode(true);
    const handleCancel = () => setIsEditMode(false);
    const handleSave = () => {
        onSave?.();
        setIsEditMode(false);
    }
    return (
        <Card
            sx={{
                mt: 2,
                p: 2,
                background: `${colors.primary[400]}`
            }}>
            <Typography
                className="title"
                variant="h4"
                align="center"
                fontWeight="bold"
                sx={{ color: colors.grey[100], mb: 2 }}
            >
                個人情報
            </Typography>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                sx={{ mt: 1, mb: 2 }}
            >
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                        <FormControl>
                            <FormLabel>名前</FormLabel>
                            <Input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => onChangeName?.(e.target.value)}
                                sx={{ flexGrow: 1 }}
                                readOnly={!isEditMode}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>ユーザーID</FormLabel>
                            <Input
                                type="text"
                                placeholder="User ID"
                                value={userId}
                                sx={{ flexGrow: 1 }}
                                readOnly
                            />
                        </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <FormControl>
                            <FormLabel>役割</FormLabel>
                            <Input value={role || "USER"} readOnly />
                        </FormControl>
                        <FormControl sx={{ flexGrow: 1 }}>
                            <FormLabel>メールアドレス</FormLabel>
                            <Input
                                type="email"
                                placeholder="...@email.com"
                                value={email}
                                onChange={(e) => onChangeEmail?.(e.target.value)}
                                readOnly={!isEditMode}
                            />
                        </FormControl>
                    </Stack>
                    <Stack spacing={1}>
                        <FormControl
                        >
                            <FormLabel>電話番号</FormLabel>
                            <Input
                                type="text"
                                placeholder="Phone Number"
                                value={phoneNumber || ""}
                                onChange={(e) => onChangePhoneNumber?.(e.target.value)}
                                readOnly={!isEditMode}
                                sx={{ flexGrow: 1 }}
                            />
                        </FormControl>
                    </Stack>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
                {isEditMode ? (
                    <>
                        <Button variant="outlined" color="info" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleSave}>
                            Save
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outlined" color="info" onClick={handleEdit}>
                            Edit
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => navigate("/warehouses")}>
                            OK
                        </Button>
                    </>
                )}
            </Stack>
        </Card>
    )
}
export default ProfileCard;