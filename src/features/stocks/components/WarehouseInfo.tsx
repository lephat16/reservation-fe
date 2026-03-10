import {
    Chip,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { STATUS } from "../../../constants/status";
import type { WarehousesData } from "../types/stock";

type WarehouseInfoProps = {
    warehouse: WarehousesData | undefined
    onDelete: () => void
    onEdit: () => void
}
const WarehouseInfo = ({
    warehouse,
    onDelete,
    onEdit,
}: WarehouseInfoProps) => {

    const statusInfo =
        STATUS[warehouse?.status as keyof typeof STATUS] ?? {
            label: "不明",
            color: "default",
        };
    return (
        <Stack>
            <Typography variant="h6">{warehouse?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
                住所: {warehouse?.location}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} mt={1}>
                <Chip
                    label={statusInfo.label}
                    color={statusInfo.color}
                    size="small"
                />
                <Tooltip title="削除">
                    <IconButton
                        aria-label="delete"
                        size="small"
                        sx={{
                            '&:hover': {
                                color: "red",
                            },
                        }}
                        onClick={onDelete}
                    >
                        <DeleteIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="編集">
                    <IconButton
                        aria-label="edit"
                        size="small"
                        sx={{
                            '&:hover': {
                                color: "orange",
                            },
                        }}
                        onClick={onEdit}
                    >
                        <EditIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    )
}
export default WarehouseInfo;