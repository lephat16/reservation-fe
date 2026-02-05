import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PaidIcon from '@mui/icons-material/Paid';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { tokens } from "../../../shared/theme";
import type { PurchaseOrderData } from "../../purchases/types/purchase";
import { useScreen } from "../../../shared/components/global/ScreenContext";
type SupplierStatCardProps = {
    purchaseOrder: PurchaseOrderData[]
}
const SupplierStatCard = ({ purchaseOrder }: SupplierStatCardProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMD = useScreen();

    return (
        <Box
            display="flex"
            flexDirection="row"
            gap={2} mb={2}
            flexWrap="wrap"
            justifyContent={"space-between"}
        >
            <Card
                sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[200],
                    width: { lg: 160, md: 100, sm: 160, xs: 50 },
                    height: { md: 178, xs: 80 },
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between",
                        placeItems: "center",
                        padding: {
                            xs: 0,
                            md: 2
                        }
                    }}
                >
                    <CreditScoreIcon
                        sx={{
                            display: { xs: "none", md: "inline-block" },
                            fontSize: {
                                lg: '3rem',
                                xs: "2rem"
                            }
                        }}
                    />
                    <Typography
                        component="div"
                        sx={{
                            fontSize: {
                                lg: '3rem',
                                xs: "2rem"
                            },
                            fontWeight: 'bold',
                        }}
                    >
                        {purchaseOrder.length}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                    >
                        合計
                    </Typography>
                </CardContent>
            </Card>
            <Card
                sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[200],
                    width: { lg: 160, md: 100, sm: 160, xs: 50 },
                    height: { md: 178, xs: 80 },
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between",
                        placeItems: "center",
                        padding: {
                            xs: 0,
                            md: 2
                        }
                    }}
                >
                    <HourglassBottomIcon
                        sx={{
                            display: { xs: "none", md: "inline-block" },
                            fontSize: {
                                lg: '3rem',
                                xs: "2rem"
                            }
                        }}
                    />
                    <Typography
                        component="div"
                        sx={{
                            fontSize: {
                                lg: '3rem',
                                xs: "2rem"
                            },
                            fontWeight: 'bold',
                        }}
                    >
                        {purchaseOrder.filter(po => po.status === "PENDING").length}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                    >
                        未処理
                    </Typography>
                </CardContent>
            </Card>
            <Card
                sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[200],
                    width: { lg: 160, md: 100, sm: 160, xs: 120 },
                    height: { md: 178, xs: 80 },
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between",
                        placeItems: "center",
                        padding: {
                            xs: 0,
                            md: 2
                        }
                    }}
                >

                    <PaidIcon
                        sx={{
                            display: { xs: "none", md: "inline-block" },
                            fontSize: {
                                lg: '3rem',
                                xs: "2rem"
                            }
                        }}
                    />
                    <Typography
                        component="div"
                        sx={{
                            fontSize: {
                                lg: '1.2rem',
                                xs: "1rem"
                            },
                            fontWeight: 'bold',
                            lineHeight: {
                                xs: 3
                            }
                        }}
                    >
                        ¥{purchaseOrder.reduce((total, po) => total + po.total, 0).toLocaleString()}
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                    >
                        支出
                    </Typography>
                </CardContent>
            </Card>

        </Box>
    )
}
export default SupplierStatCard;