import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PaidIcon from '@mui/icons-material/Paid';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { tokens } from "../../../shared/theme";
import type { PurchaseOrderData } from "../../purchases/types/purchase";
type SupplierStatCardProps = {
    purchaseOrder: PurchaseOrderData[]
}
const SupplierStatCard = ({ purchaseOrder }: SupplierStatCardProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box display="flex" flexDirection="row" gap={2} mb={2}>
            <Card
                sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[100],
                    width: 160,
                    height: 178,
                    // display: "flex"
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        // flex: 1,
                        height: "100%",
                        justifyContent: "space-between",
                        placeItems: "center"
                    }}
                >
                    <CreditScoreIcon sx={{ fontSize: 40 }} />
                    <Typography
                        component="div"
                        sx={{
                            fontSize: {
                                xl: '2rem',
                                xs: '3rem'
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
                    color: colors.grey[100],
                    width: 160,
                    height: 178,
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        // flex: 1,
                        height: "100%",
                        justifyContent: "space-between",
                        placeItems: "center"
                    }}
                >

                    <PaidIcon sx={{ fontSize: 40 }} />
                    <Typography
                        component="div"
                        sx={{
                            fontSize: 24,
                            fontWeight: 'bold',
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
            <Card
                sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[100],
                    width: 160,
                    height: 178,
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        // flex: 1,
                        height: "100%",
                        justifyContent: "space-between",
                        placeItems: "center"
                    }}
                >

                    <HourglassBottomIcon sx={{ fontSize: 40 }} />
                    <Typography
                        component="div"
                        sx={{
                            fontSize: {
                                xl: '2rem',
                                xs: '3rem'
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
        </Box>
    )
}
export default SupplierStatCard;