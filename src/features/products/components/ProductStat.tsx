import { Box, Card, CardContent, Stack, Tooltip, Typography, useTheme, type SxProps } from "@mui/material";
import MovingIcon from '@mui/icons-material/Moving';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { tokens } from "../../../shared/theme";

type InfoCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    changePercent?: number | null;
    isUp?: boolean | null;
    width?: number | string;
    tooltipValue?: string;
    sx?: SxProps;
}
const ProductStat = ({
    icon,
    title,
    value,
    changePercent = null,
    isUp = null,
    tooltipValue,
    sx,
}: InfoCardProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    return (
        <Card
            sx={{
                backgroundColor: colors.primary[400],
                color: colors.grey[100],
                display: "flex",
                width: { xs: 90, sm: 115, xl: 200 },

                ...sx,
            }}
        >
            <Box
                sx={{ display: "flex", flexDirection: "column" }}
                flexGrow={1}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "space-between",
                        alignItems: "center",
                        "&.MuiCardContent-root": {
                            padding: "10px"
                        },
                    }}
                >
                    <Stack direction="row" gap={2} justifyContent="space-between">
                        {icon}
                        <Stack direction="column" gap={1} alignItems="flex-end">
                            {isUp === true && <MovingIcon color="success" fontSize="small" />}
                            {isUp === false && <TrendingDownIcon color="error" fontSize="small" />}
                            {changePercent !== null && (
                                <Typography variant="body2">{Math.abs(changePercent).toFixed(2)}%</Typography>
                            )}
                        </Stack>
                    </Stack>
                    {tooltipValue ? (
                        <Tooltip title={tooltipValue}>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: { xl: "2rem", sm: "1.2rem", xs: "1rem" },
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {value}
                            </Typography>
                        </Tooltip>
                    ) : (
                        <Typography
                            component="div"
                            sx={{ fontSize: { xl: "2rem", sm: "1.2rem", xs: "1rem" }, fontWeight: "bold" }}
                        >
                            {value}
                        </Typography>
                    )}
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{
                            color: "text.secondary",
                            fontSize: { xs: "0.6rem" }
                        }}
                    >
                        {title}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    )
}

export default ProductStat;