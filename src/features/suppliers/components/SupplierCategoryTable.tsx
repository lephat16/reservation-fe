import { Chip, IconButton, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, useTheme } from "@mui/material";
import { styledTable } from "../../../shared/components/global/StyleTable";
import { useNavigate } from "react-router-dom";
import { useSupplierProducWithPriceHistory } from "../hooks/useSupplierProducWithPriceHistory";
import { useState } from "react";
import { tokens } from "../../../shared/theme";
import type { SupplierProductData, SupplierProductFormType } from "../types/supplier";
import InfoIcon from '@mui/icons-material/Info';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SupplierProductForm from "./SupplierProductForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierAPI } from "../api/supplierAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import type { AxiosError } from "axios";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useScreen } from "../../../shared/components/global/ScreenContext";

type SupplierCategoryTableProps = {
    categoryName: string | undefined;
    products: SupplierProductData[];
    supplierId: number;
    supplierStatus: "ACTIVE" | "INACTIVE";
    showSnackbar: (message: string, type: "success" | "error") => void;
};

const SupplierCategoryTable = ({ categoryName, products, supplierId, supplierStatus, showSnackbar }: SupplierCategoryTableProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMD = useScreen()

    const [openSupplierProductDialog, setOpenSupplierProductDialog] = useState(false);
    const [selectedSupplierProduct, setSelectedSupplierProduct] = useState<SupplierProductData | null>(null);
    const { data, isLoading, error } = useSupplierProducWithPriceHistory(selectedSupplierProduct?.sku ?? null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async (updateSupplierProduct: SupplierProductFormType) => {
            const updatedRes = await supplierAPI.updateSupplierProduct(updateSupplierProduct, selectedSupplierProduct?.id ?? 0);
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
    })
    return (
        <>
            {(error) && (
                <ErrorState />
            )}
            {(isLoading) ? (
                <Skeleton variant="rectangular" height={400} />

            ) : (
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
                            <col style={{ width: isMD ? "25%" : "20%" }} />
                            <col style={{ width: isMD ? "25%" : "15%" }} />
                            {!isMD && (
                                <>
                                    <col style={{ width: "20%" }} />
                                    <col style={{ width: "15%" }} />
                                </>
                            )}
                            <col style={{ width: isMD ? "25%" : "15%" }} />
                            <col style={{ width: isMD ? "25%" : "15%" }} />
                        </colgroup>
                        <TableHead >
                            <TableRow>
                                <TableCell
                                    align="center"
                                    colSpan={isMD ? 4 : 6}
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
                                {!isMD && (
                                    <>
                                        <TableCell>単価</TableCell>
                                        <TableCell>在庫</TableCell>
                                    </>
                                )}
                                <TableCell align="center">ステータス</TableCell>
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

                                    {!isMD && (
                                        <>
                                            <TableCell>¥{Number(p.price).toLocaleString()}</TableCell>
                                            <TableCell >{p.stock}</TableCell>
                                        </>
                                    )}
                                    <TableCell align="center">
                                        <Chip
                                            label={p.status}
                                            color={p.status === "ACTIVE" ? "success" : "default"}
                                            size="small"
                                            variant="filled"
                                        />
                                    </TableCell>
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
                                                        (document.activeElement as HTMLElement)?.blur();
                                                        setSelectedSupplierProduct(p);
                                                        setOpenSupplierProductDialog(true)
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
            )}

            <SupplierProductForm
                open={openSupplierProductDialog}
                onClose={() => setOpenSupplierProductDialog(false)}
                onSubmit={(data) => {
                    updateMutation.mutate(data);
                }}
                supplierProduct={data}
            />
        </>
    );
};

export default SupplierCategoryTable;

