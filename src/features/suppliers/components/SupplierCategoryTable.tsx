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
import React, { useState } from "react";
import { tokens } from "../../../shared/theme";
import type { SupplierProductData, SupplierProductFormType } from "../types/supplier";
import InfoIcon from '@mui/icons-material/Info';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SupplierProductForm from "./SupplierProductForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierAPI } from "../api/supplierAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { STATUS } from "../../../constants/status";
import { ORDER_TYPE } from "../../../constants/order";
import { red } from "@mui/material/colors";
import { useDialogs } from "../../../shared/hooks/dialogs/useDialogs";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/** 
 * サプライヤーカテゴリテーブルコンポーネント
 * 
 * サプライヤーの商品情報（SKU、単価、在庫、ステータスなど）を表示し、商品の詳細情報や発注操作を提供する
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
    const { isSM, isMD } = useScreen();
    const { confirmDelete } = useDialogs();

    const [openSupplierProductDialog, setOpenSupplierProductDialog] = useState(false);
    const [selectedSupplierProduct, setSelectedSupplierProduct] = useState<SupplierProductData | null>(null);
    const { data, isLoading, error } = useSupplierProducWithPriceHistory(selectedSupplierProduct?.sku ?? null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuProduct, setMenuProduct] = useState<SupplierProductData | null>(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async (updateSupplierProduct: SupplierProductFormType) => {
            const updatedRes = await supplierAPI.updateSupplierProduct(updateSupplierProduct, selectedSupplierProduct?.sku ?? "");
            return updatedRes;
        },
        onSuccess: (response,) => {
            // 成功時の処理
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success"); // スナックバー表示

            queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (sku: string) => supplierAPI.deleteSupplierProductBySku(sku),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || "削除に失敗しました", "error");
        }
    });
    const handleDelete = async (sp: SupplierProductData) => {
        const ok = await confirmDelete(
            `ユーザー「${sp.sku}」を削除しますか？`
        );

        if (ok) {
            deleteMutation.mutate(sp.sku);
        }
    };

    const handleOpenMenuOnMobile = (event: React.MouseEvent<HTMLElement>, product: SupplierProductData) => {
        setAnchorEl(event.currentTarget);
        setMenuProduct(product);
    };
    const handleCloseMenuOnMobile = () => {
        setAnchorEl(null);
    };

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
                        minWidth: { xs: 308, md: 600 }
                    }}
                >
                    <Table
                        sx={{
                            tableLayout: "fixed",
                            ...styledTable(colors, {
                                rowHoverBg: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                            }),
                            '& .MuiTableCell-root': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            },
                        }}
                    >
                        <colgroup>
                            <col style={{ width: isMD ? "30%" : "20%" }} />
                            <col style={{ width: isMD ? "25%" : "20%" }} />
                            {!isMD && (
                                <>
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "10%" }} />
                                </>
                            )}
                            <col style={{ width: isMD ? "25%" : "20%" }} />
                            <col style={{ width: isMD ? "20%" : "20%" }} />
                        </colgroup>
                        <TableHead >
                            <TableRow>
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
                                        {!isSM ?
                                            <Stack direction="row" justifyContent="center">
                                                <Tooltip title={ORDER_TYPE.PURCHASE.label}>
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
                                                        size="small"
                                                        sx={{
                                                            '&:hover': {
                                                                color: colors.blueAccent[500],
                                                            },
                                                        }}
                                                        onClick={() => {
                                                            (document.activeElement as HTMLElement)?.blur();
                                                            setSelectedSupplierProduct(p);
                                                            setOpenSupplierProductDialog(true);
                                                        }}
                                                    >
                                                        <InfoIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="削除">
                                                    <IconButton
                                                        aria-label="delete"
                                                        size="small"
                                                        sx={{
                                                            '&:hover': {
                                                                color: theme.alpha(red[700], 1),
                                                            },
                                                        }}
                                                        onClick={() => handleDelete(p)}
                                                    >
                                                        <DeleteIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack> :
                                            <>
                                                <IconButton
                                                    aria-label="操作"
                                                    id={`action-button-${p.id}`}
                                                    aria-controls={Boolean(anchorEl) ? 'long-menu' : undefined}
                                                    aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                                                    aria-haspopup="true"
                                                    onClick={(e) => handleOpenMenuOnMobile(e, p)}
                                                    size="small"
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>

                                            </>}

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            )}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenuOnMobile}
                slotProps={{
                    paper: {
                        style: {
                            backgroundColor: colors.blueAccent[800],
                            color: colors.grey[100],
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        navigate("/purchase-order/create", {
                            state: {
                                preselectedSupplierId: supplierId,
                                preselectedSku: menuProduct?.sku,
                            },
                        });
                        handleCloseMenuOnMobile();
                    }}
                >
                    発注
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        setOpenSupplierProductDialog(true);
                        handleCloseMenuOnMobile();
                    }}
                >
                    詳細
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        if (menuProduct)
                            handleDelete(menuProduct);
                        handleCloseMenuOnMobile();
                    }}
                >
                    削除
                </MenuItem>
            </Menu>
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

