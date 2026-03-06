import {
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    useTheme
} from "@mui/material";
import { styledTable } from "../../../shared/styles/StyleTable";
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
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { STATUS } from "../../../constants/status";

/** 
 * サプライヤーカテゴリーテーブルコンポーネント
 * 
 * サプライヤーの商品情報（SKU、単価、在庫、ステータスなど）を表示し、商品の詳細情報や注文操作を提供する
 * 
 * @param categoryName - 商品カテゴリ名
 * @param products - 商品データのリスト
 * @param supplierId - サプライヤーID
 * @param supplierStatus - サプライヤーのステータス（"ACTIVE" または "INACTIVE"）
 * @param showSnackbar - スナックバーを表示するコールバック（成功メッセージやエラーメッセージ）
 */

type SupplierCategoryTableProps = {
    products: SupplierProductData[];
    supplierId: number;
    supplierStatus: keyof typeof STATUS;
    showSnackbar: (message: string, type: "success" | "error") => void;
};

const SupplierCategoryTable = ({ products, supplierId, supplierStatus, showSnackbar }: SupplierCategoryTableProps) => {
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
            const updatedRes = await supplierAPI.updateSupplierProduct(updateSupplierProduct, selectedSupplierProduct?.sku ?? "");
            return updatedRes;
        },
        onSuccess: (response) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success"); // スナックバー表示
            queryClient.invalidateQueries({ queryKey: ["supplier-product-with-price-history", selectedSupplierProduct?.sku] });
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
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
                            ...styledTable(colors)
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
                                            color={p.status === STATUS.ACTIVE.value ? "success" : "default"}
                                            size="small"
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" justifyContent="center">
                                            <Tooltip title="注文">
                                                <span>
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
                                                </span>
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

