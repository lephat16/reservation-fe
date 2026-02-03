import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "../../../shared/theme";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import Header from "../../../pages/Header";
import type { SupplierData, SupplierProductData } from "../types/supplier";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useSupplierProductsWithStock } from "../hooks/useSupplierProductsWithStock";
import SupplierDetailCard from "./SupplierDetailCard";
import { useEffect, useState } from "react";
import CustomSnackbar from "../../../shared/components/global/CustomSnackbar";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SupplierForm from "./SupplierForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierAPI } from "../api/supplierAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import type { AxiosError } from "axios";
import { DeleteConfirmDialog } from "../../../shared/components/DeleteConfirmDialog";
import { usePurchasesOrderBySupplier } from "../../purchases/hooks/usePurchasesOrderBySupplier";
import type { PurchaseOrderData } from "../../purchases/types/purchase";
import { styledTable } from "../../../shared/components/global/StyleTable";
import InfoIcon from '@mui/icons-material/Info';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SupplierStatCard from "./SupplierStatCard";
import { useSupplierProducWithPriceHistory } from "../hooks/useSupplierProducWithPriceHistory";

type SupplierCategoryTableProps = {
    categoryName: string | undefined;
    products: SupplierProductData[];
    supplierId: number;
    supplierStatus: "ACTIVE" | "INACTIVE";
};

const SupplierCategoryTable = ({ categoryName, products, supplierId, supplierStatus }: SupplierCategoryTableProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [openSupplierProductDialog, setOpenSupplierProductDialog] = useState(false);
    const [selectedSku, setSelectedSku] = useState<string | null>(null);
    const { data, isLoading, error } = useSupplierProducWithPriceHistory(selectedSku);
    const navigate = useNavigate();
    return (
        <>
            <TableContainer
                component={Paper}
                sx={{
                    mb: 3,
                    maxHeight: 360,
                    overflowY: 'auto',
                }}
            >
                <Table
                    sx={{
                        ...styledTable(theme.palette.mode)
                    }}
                >
                    <colgroup>
                        <col style={{ width: isMobile ? "50%" : "30%" }} />
                        <col style={{ width: isMobile ? "25%" : "20%" }} />
                        {!isMobile && (
                            <>
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "15%" }} />
                            </>
                        )}
                        <col style={{ width: isMobile ? "25%" : "15%" }} />
                    </colgroup>
                    <TableHead >
                        <TableRow>
                            <TableCell
                                align="center"
                                colSpan={isMobile ? 3 : 5}
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: colors.blueAccent[500],
                                    fontSize: 16,
                                    color: colors.grey[100]
                                }}>
                                {categoryName}
                            </TableCell>
                        </TableRow>
                        <TableRow
                            sx={{ backgroundColor: colors.primary[900] }}>
                            <TableCell>
                                商品名
                            </TableCell>
                            <TableCell>
                                SKU
                            </TableCell>
                            {!isMobile && (
                                <>
                                    <TableCell>単価</TableCell>
                                    <TableCell>在庫</TableCell>
                                </>
                            )}
                            <TableCell align="center">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((p) => (
                            <TableRow key={p.id} hover>
                                <TableCell >
                                    {p.product}
                                </TableCell>
                                <TableCell>
                                    {p.sku}
                                </TableCell>

                                {!isMobile && (
                                    <>
                                        <TableCell>¥{Number(p.price).toLocaleString()}</TableCell>
                                        <TableCell >{p.stock}</TableCell>
                                    </>
                                )}
                                <TableCell>
                                    <Stack direction="row" justifyContent="center">
                                        <Tooltip title="注文">
                                            <IconButton
                                                aria-label="see-more"
                                                size="medium"
                                                sx={{
                                                    '&:hover': {
                                                        color: colors.greenAccent[500],
                                                    },
                                                }}
                                                onClick={() => {
                                                    navigate("/purchase-order/create", {
                                                        state: {
                                                            preselectedSupplierId: supplierId,
                                                            preselectedSku: p.sku,
                                                        }
                                                    });
                                                }}
                                                disabled={supplierStatus === "INACTIVE" || p.status === "INACTIVE"}
                                            >
                                                <PostAddIcon fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="詳細">
                                            <IconButton
                                                aria-label="info"
                                                size="medium"
                                                sx={{
                                                    '&:hover': {
                                                        color: colors.blueAccent[500],
                                                    },
                                                }}
                                                onClick={() => {
                                                    setOpenSupplierProductDialog(true)
                                                    setSelectedSku(p.sku);
                                                }}
                                            >
                                                <InfoIcon fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog
                open={openSupplierProductDialog}
                onClose={() => setOpenSupplierProductDialog(false)}
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
                    製品の情報
                </DialogTitle>
                
            </Dialog>
        </>
    );
};

type OrderBySupplierProps = {
    purchaseOrder: PurchaseOrderData[]
}

const OrderBySupplierTable = ({ purchaseOrder }: OrderBySupplierProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [openPODialog, setOpenPODialog] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrderData | null>(null);
    return (
        <>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table
                    stickyHeader
                    sx={{
                        ...styledTable(theme.palette.mode)
                    }}
                >
                    <colgroup>
                        <col style={{ width: isMobile ? "20%" : "15%" }} />
                        <col style={{ width: isMobile ? "40%" : "25%" }} />
                        <col style={{ width: isMobile ? "30%" : "25%" }} />
                        {!isMobile && (
                            <>
                                <col style={{ width: "15%" }} />
                                <col style={{ width: "30%" }} />
                            </>
                        )}
                        <col style={{ width: isMobile ? "10%" : "5%" }} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                align="center"
                                colSpan={isMobile ? 4 : 6}
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
                            {!isMobile && (
                                <>
                                    <TableCell>ステータス</TableCell>
                                    <TableCell>説明</TableCell>
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
                                    {!isMobile && (
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
                                sx={{ borderTop: "1px solid", borderColor: colors.grey[700] }}
                            >
                                <Box flex={3}>{row.productName}</Box>
                                <Box flex={1} textAlign="right">{row.qty}</Box>
                                <Box flex={1} textAlign="right">{row.cost.toLocaleString()}</Box>
                                <Box flex={1} textAlign="right">{(row.qty * row.cost).toLocaleString()}</Box>
                            </Stack>
                        ))}
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
            </Dialog>
        </>
    )
}



const SupplierPage = () => {

    const { supplierId } = useParams<{ supplierId: string }>();

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openEditSupplierForm, setOpenEditSupplierForm] = useState(false);

    const queryClient = useQueryClient();

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const { isLoading, error, data } = useSupplierProductsWithStock(Number(supplierId));
    const { isLoading: isLoadingPO, error: errorPO, data: dataPO = [] } = usePurchasesOrderBySupplier(Number(supplierId));
    useEffect(() => {
        if ((data?.supplierProducts ?? []).length > 0 && selectedCategoryId === null) {
            setSelectedCategoryId(data?.supplierProducts[0].categoryId ?? null);
        }
    }, [data, selectedCategoryId]);

    const handleBackSupplier = () => {
        if (data?.supplierProducts && data.supplierProducts.length > 0) {
            const currentIndex = data.supplierProducts.findIndex(sp => sp.categoryId === selectedCategoryId);
            const prevIndex = (currentIndex - 1 + data.supplierProducts.length) % data.supplierProducts.length;
            setSelectedCategoryId(data.supplierProducts[prevIndex].categoryId ?? null);
        }
    }
    const handleNextSupplier = () => {
        if (data?.supplierProducts && data.supplierProducts.length > 0) {
            const currentIndex = data.supplierProducts.findIndex(sp => sp.categoryId === selectedCategoryId);
            const nextIndex = (currentIndex + 1) % data.supplierProducts.length;
            setSelectedCategoryId(data.supplierProducts[nextIndex].categoryId ?? null);
        }
    }

    const updateMutation = useMutation({
        mutationFn: async (updateProduct: SupplierData) => {
            const updatedRes = await supplierAPI.updateSupplier(updateProduct, Number(supplierId));
            return updatedRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["supplier", Number(supplierId)] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => supplierAPI.deleteSupplier(Number(supplierId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["supplier"] });
            setTimeout(() => {
                // navigate("/purchase-order");
            }, 500);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    })
    return (
        <Box m={3}>
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                <Header
                    title="仕入先情報"
                    subtitle="在庫と最近の注文を確認できます"
                />
            )}
            <Box m={3} minHeight="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />
                {/* エラー表示 */}
                {(error || errorPO) && (
                    <ErrorState />
                )}

                {(isLoading) ? (
                    <Skeleton variant="rectangular" height={400} />

                ) : (
                    data && (
                        <>
                            <Box display="flex" justifyContent="space-between">
                                <Box>
                                    <SupplierDetailCard
                                        supplier={data?.supplier}
                                        openDeleteDialog={() => setOpenDeleteConfirm(true)}
                                        openEditDialog={() => setOpenEditSupplierForm(true)}
                                    />
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        mb={2}
                                    >
                                        <Stack
                                            direction="row"
                                            gap={1}
                                        >
                                            {data?.supplierProducts.map(sp => (
                                                <Button
                                                    key={sp.categoryId}
                                                    color="info"
                                                    variant={selectedCategoryId === sp.categoryId ? "contained" : "outlined"}
                                                    onClick={() => {
                                                        setSelectedCategoryId(sp.categoryId ?? null);

                                                    }}
                                                >
                                                    {sp.categoryName}
                                                </Button>
                                            ))}
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            gap={2}
                                        >
                                            <Tooltip title="戻">
                                                <IconButton onClick={handleBackSupplier} aria-label="戻">
                                                    <ArrowBackIosIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="次">
                                                <IconButton onClick={handleNextSupplier} aria-label="次">
                                                    <ArrowForwardIosIcon />
                                                </IconButton>
                                            </Tooltip>

                                        </Stack>
                                    </Stack>
                                </Box>
                                <SupplierStatCard purchaseOrder={dataPO} />
                            </Box>
                            <Box mb={3}>
                                {data?.supplierProducts
                                    .filter(sp => sp.categoryId === selectedCategoryId)
                                    .map(cat => (
                                        <SupplierCategoryTable
                                            key={cat.categoryName}
                                            categoryName={cat.categoryName}
                                            products={cat.products}
                                            supplierId={Number(supplierId)}
                                            supplierStatus={data.supplier.supplierStatus}
                                        />
                                    ))}
                            </Box>
                            {(isLoadingPO) ? (
                                <Skeleton variant="rectangular" height={400} />
                            ) : (
                                <Box>
                                    <OrderBySupplierTable
                                        purchaseOrder={dataPO}
                                    />
                                </Box>
                            )}
                            {openEditSupplierForm &&
                                <SupplierForm
                                    open
                                    onClose={() => setOpenEditSupplierForm(false)}
                                    onSubmit={(data) => {
                                        updateMutation.mutate(data);
                                    }}
                                    supplier={data.supplier}
                                />
                            }

                            <DeleteConfirmDialog
                                open={openDeleteConfirm}
                                onClose={() => setOpenDeleteConfirm(false)}
                                targetName={data.supplier.name}
                                onDelete={() => deleteMutation.mutate()}
                                isDeleting={deleteMutation.isPending}
                            />
                        </>
                    )
                )}
            </Box>
        </Box>
    )
}

export default SupplierPage;