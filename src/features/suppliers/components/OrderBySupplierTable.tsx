import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import type { PurchaseOrderData } from "../../purchases/types/purchase";
import { tokens } from "../../../shared/theme";
import { useState } from "react";
import { styledTable } from "../../../shared/components/global/StyleTable";
import InfoIcon from '@mui/icons-material/Info';
import { useScreen } from "../../../shared/hooks/ScreenContext";

type OrderBySupplierProps = {
    purchaseOrder: PurchaseOrderData[]
}

const OrderBySupplierTable = ({ purchaseOrder }: OrderBySupplierProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { isMD } = useScreen();
    const [openPODialog, setOpenPODialog] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrderData | null>(null);
    return (
        <>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table
                    stickyHeader
                    sx={{
                        ...styledTable(colors)
                    }}
                >
                    <colgroup>
                        <col style={{ width: isMD ? "20%" : "15%" }} />
                        <col style={{ width: isMD ? "40%" : "25%" }} />
                        <col style={{ width: isMD ? "30%" : "25%" }} />
                        {!isMD && (
                            <>
                                <col style={{ width: "15%" }} />
                                <col style={{ width: "30%" }} />
                            </>
                        )}
                        <col style={{ width: isMD ? "10%" : "5%" }} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                align="center"
                                colSpan={isMD ? 4 : 6}
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                }}
                            >
                                引き取り履歴
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>日付</TableCell>
                            <TableCell>合計</TableCell>
                            {!isMD && (
                                <>
                                    <TableCell>ステータス</TableCell>
                                    <TableCell>備考</TableCell>
                                </>
                            )}
                            <TableCell />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {(purchaseOrder) ? (
                            purchaseOrder.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>
                                        {new Date(p.createdAt).toLocaleDateString("ja-JP")}
                                    </TableCell>
                                    <TableCell>¥{p.total.toLocaleString()}</TableCell>
                                    {!isMD && (
                                        <>
                                            <TableCell>{p.status}</TableCell>
                                            <TableCell>{p.description}</TableCell>
                                        </>
                                    )}
                                    <TableCell>
                                        <Tooltip title="詳細">
                                            <IconButton
                                                aria-label="see-more"
                                                size="small"
                                                sx={{
                                                    '&:hover': {
                                                        color: colors.blueAccent[500],
                                                    },
                                                }}
                                                onClick={() => {
                                                    setSelectedPO(p);
                                                    setOpenPODialog(true)
                                                }}
                                            >
                                                <InfoIcon fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                    該当する商品がありません
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog
                open={openPODialog}
                onClose={() => setOpenPODialog(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: colors.blueAccent[900],
                            borderRadius: 2,
                            p: 2,
                        }
                    }
                }}
            >
                <DialogTitle align="center" variant="h4" fontWeight={600}>
                    注文の詳細
                </DialogTitle>
                <DialogContent dividers>
                    <Box
                        border={1}
                        borderRadius={1}
                        sx={{ borderColor: colors.grey[400], overflowX: 'auto' }}
                    >
                        {/* ヘッダー */}
                        <Stack direction="row" p={1} sx={{ fontWeight: "bold" }}>
                            <Box flex={3}>商品名</Box>
                            <Box flex={1} textAlign="right">数量</Box>
                            <Box flex={1} textAlign="right">単価</Box>
                            <Box flex={1} textAlign="right">小計</Box>
                        </Stack>

                        {/* 注文行 */}
                        {selectedPO?.details.map((row, index) => (
                            <Stack
                                key={index}
                                direction="row"
                                p={1}
                                sx={{ borderTop: "1px solid", borderColor: colors.grey[600] }}
                            >
                                <Box flex={3}>{row.productName}</Box>
                                <Box flex={1} textAlign="right">{row.qty}</Box>
                                <Box flex={1} textAlign="right">{row.cost.toLocaleString()}</Box>
                                <Box flex={1} textAlign="right">{(row.qty * row.cost).toLocaleString()}</Box>
                            </Stack>
                        ))}
                    </Box>
                    <Box
                        mt={2}
                        p={1}
                        border={1}
                        borderRadius={1}
                        sx={{
                            borderColor: colors.grey[400],
                            height: 80,          
                            overflowY: 'auto',
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            備考
                        </Typography>
                        <Typography variant="body2">
                            {selectedPO?.description}
                        </Typography>
                    </Box>
                    <Typography variant="h6" mt={2} textAlign="right">
                        合計金額: <strong>
                            {selectedPO?.details.reduce((total, po) =>
                                total + (po.cost * po.qty), 0).toLocaleString() ?? 0}¥
                        </strong>
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => setOpenPODialog(false)}
                    >
                        確認
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default OrderBySupplierTable;