import type { WarehousesData, WarehouseWithTotalChangedQtyData } from "../types/stock";


import WidgetsIcon from '@mui/icons-material/Widgets';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MovingIcon from '@mui/icons-material/Moving';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Battery20Icon from '@mui/icons-material/Battery20';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../shared/theme";
import { useScreen } from "../../../shared/hooks/ScreenContext";
type WarehouseStatProps = {
    selectedWarehouse: WarehousesData;
    selectedWarehouseWithTotal: WarehouseWithTotalChangedQtyData;

}

const WarehouseStats = ({
    selectedWarehouse,
    selectedWarehouseWithTotal
}: WarehouseStatProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { isSM, } = useScreen();

    // 合計数量の計算
    const totalQuantity = selectedWarehouse?.stocks
        .map(stock => stock.quantity)
        .reduce((sum, qty) => sum + qty, 0);
    // 他の指標（受領PO、出荷SO）の計算
    const totalReceivedPO = selectedWarehouseWithTotal?.totalReceivedPo ?? 0
    const totalReceivedPO7d = selectedWarehouseWithTotal?.totalReceivedPoInWeek ?? 0
    const percentPO7d = totalReceivedPO > 0
        ? (totalReceivedPO7d / totalReceivedPO) * 100
        : 0
    const totalDeliveredSo = selectedWarehouseWithTotal?.totalDeliveredSo ?? 0
    const totalDeliveredSo7d = selectedWarehouseWithTotal?.totalDeliveredSoInWeek ?? 0
    const percentSO7d = totalDeliveredSo > 0
        ? (totalDeliveredSo7d / totalDeliveredSo) * 100
        : 0
    const percentQty = totalQuantity && selectedWarehouse?.stockLimit
        ? (totalQuantity / selectedWarehouse.stockLimit) * 100
        : 0;

    return (
        <Box
            display='flex'
            gap={2}
            // flexDirection={{ xl: 'column', lg: 'row', xs: 'column' }}
            flexWrap="wrap"
            flex={isSM ? 1 : ""}
        >
            <Stack direction="row" gap={2} justifyContent="space-between">
                <Card
                    sx={{
                        backgroundColor: colors.primary[400],
                        color: colors.grey[100],
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: { xs: 80, md: 120, lg: 140 }
                        }}
                        flexGrow={1}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                                justifyContent: "space-between",
                                p: { xs: 1, md: 2 },
                                "&:last-child": { pb: 1 }
                            }}
                        >
                            <Stack direction="row" gap={2} justifyContent="space-between">
                                <WidgetsIcon sx={{ fontSize: { xl: 30, xs: 20 } }} />
                                <Stack direction="column">
                                    <Battery20Icon sx={{ alignSelf: "center" }} color="warning" />
                                    <Typography
                                        color="info"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: {
                                                xs: "0.6rem",
                                                xl: "0.8rem"
                                            }
                                        }}
                                    >
                                        {Math.round(percentQty * 100) / 100}%
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: {
                                        xs: "1.2rem",
                                        xl: "2rem"
                                    },
                                    fontWeight: 'bold',
                                }}
                            >
                                {totalQuantity}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: {
                                        xs: "0.6rem",
                                        xl: "0.8rem",
                                    }
                                }}
                            >
                                在庫合計
                            </Typography>
                        </CardContent>
                    </Box>
                </Card>
                <Card
                    sx={{
                        backgroundColor: colors.primary[400],
                        color: colors.grey[100],
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: { xs: 80, md: 120, lg: 140 }
                        }}
                        flexGrow={1}>
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                                justifyContent: "space-between",
                                p: { xs: 1, md: 2, },
                                "&:last-child": { pb: 1 }
                            }}
                        >
                            <Stack direction="row" gap={2} justifyContent="space-between">
                                <PointOfSaleIcon sx={{ fontSize: { xl: 30, xs: 20 } }} />
                                <Stack direction="column" sx={{ visibility: "hidden" }}>
                                    <MovingIcon sx={{ alignSelf: "center" }} color="success" />
                                    <Typography
                                        color="info"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: {
                                                xs: "0.6rem",
                                                xl: "0.8rem"
                                            }
                                        }}
                                    >
                                        {Math.round(percentPO7d * 100) / 100}%
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: {
                                        xs: "1.2rem",
                                        xl: "2rem"
                                    },
                                    fontWeight: 'bold',
                                }}
                            >
                                {selectedWarehouse?.stocks
                                    .map(stock => stock.reservedQuantity)
                                    .reduce((sum, reserverdqty) => sum + reserverdqty, 0)}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: {
                                        xs: "0.6rem",
                                        xl: "0.8rem",
                                    }
                                }}
                            >
                                予約合計
                            </Typography>
                        </CardContent>

                    </Box>

                </Card>
            </Stack>
            <Stack direction="row" gap={2} justifyContent="space-between">
                <Card
                    sx={{
                        backgroundColor: colors.primary[400],
                        color: colors.grey[100],
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: { xs: 80, md: 120, lg: 140 }
                        }}
                        flexGrow={1}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                                justifyContent: "space-between",
                                p: { xs: 1, md: 2 },
                                "&:last-child": { pb: 1 }
                            }}
                        >
                            <Stack direction="row" gap={2} justifyContent="space-between">
                                <ArchiveIcon sx={{ fontSize: { xl: 30, xs: 20 } }} />
                                <Stack direction="column" >
                                    <MovingIcon sx={{ alignSelf: "center" }} color="success" />
                                    <Typography
                                        color="success"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: {
                                                xs: "0.6rem",
                                                xl: "0.8rem"
                                            }
                                        }}
                                    >
                                        {Math.round(percentPO7d * 100) / 100}%
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: {
                                        xs: "1.2rem",
                                        xl: "2rem"
                                    },
                                    fontWeight: 'bold',
                                }}
                            >
                                {totalReceivedPO}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: {
                                        xs: "0.6rem",
                                        xl: "0.8rem",
                                    }
                                }}
                            >
                                入荷合計
                            </Typography>
                        </CardContent>
                    </Box>
                </Card>
                <Card
                    sx={{
                        backgroundColor: colors.primary[400],
                        color: colors.grey[100],
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: { xs: 80, md: 120, lg: 140 }
                        }}
                        flexGrow={1}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                                justifyContent: "space-between",
                                p: { xs: 1, md: 2 },
                                "&:last-child": { pb: 1 }
                            }}
                        >
                            <Stack direction="row" gap={2} justifyContent="space-between">
                                <UnarchiveIcon sx={{ fontSize: { xl: 30, xs: 20 } }} />
                                <Stack direction="column" >
                                    <TrendingDownIcon sx={{ alignSelf: "center" }} color="error" />
                                    <Typography
                                        color="error"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: {
                                                xs: "0.6rem",
                                                xl: "0.8rem"
                                            }
                                        }}
                                    >
                                        {Math.round(percentSO7d * 100) / 100}%
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: {
                                        xs: "1.2rem",
                                        xl: "2rem"
                                    },
                                    fontWeight: 'bold',
                                }}
                            >
                                {totalDeliveredSo}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: {
                                        xs: "0.6rem",
                                        xl: "0.8rem",
                                    }
                                }}
                            >
                                出荷合計
                            </Typography>
                        </CardContent>

                    </Box>

                </Card>
            </Stack>
        </Box>
    )
}

export default WarehouseStats;