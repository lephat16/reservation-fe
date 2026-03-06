import {
    Box,
    Button,
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
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { tokens } from "../../../shared/theme";
import { useNavigate, useParams } from "react-router-dom";
import type { SaleOrderData, SaleOrderDetailData } from "../types/sell";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../../../shared/components/layout/Header";
import * as yup from "yup";
import { SubmitConfirmDialog } from "../../purchases/components/PurchaseOrderDetailPage";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { saleAPI } from "../api/saleAPI";
import { useSaleOrderDetail } from "../hooks/useSaleOrderDetail";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import useRoleFlags from "../../auth/hooks/useRoleFlags";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../../shared/hooks/dialogs/useDialogs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styledTable } from "../../../shared/styles/StyleTable";
import type { Column } from "../../../shared/types/shared";
import { cellStyle } from "../../../shared/styles/cellSyle";
import { renderStatusChip } from "../../purchases/PurchaseOrderPage";

/**
 * 販売注文詳細ページコンポーネント
 *
 * 指定された受注IDに基づき販売注文の詳細情報を取得し、
 * 商品一覧、数量、単価、合計金額、注文説明を表示します。
 * また、注文の編集・削除・受注確定・出荷操作を行うことができます。
 */

type SaleOrderDetailRow = SaleOrderDetailData & {
    subtotal: number;
};

const descriptionSchema = yup.object({
    description: yup
        .string()
        .required("説明を入力してください")
        .max(500, "説明は500文字以内で入力してください"),
});

const SellOrderDetailPage = () => {

    // フック
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { soId } = useParams<{ soId: string }>();
    const { isStaff, isWarehouse } = useRoleFlags();
    const { isSM } = useScreen();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { confirmDelete } = useDialogs();
    const { showSnackbar, } = useSnackbar();  // スナックバー管理用カスタムフック

    // /ステート
    const [details, setDetails] = useState<SaleOrderDetailData[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);

    // 注文詳細取得
    const { isLoading, error, data } = useSaleOrderDetail(Number(soId));

    const rows: SaleOrderDetailRow[] = useMemo(() => {
        return (details ?? []).map(d => ({
            ...d,
            subtotal: d.qty * d.price
        }));
    }, [details]);
    // テーブルの列定義
    const columns: Column<SaleOrderDetailRow>[] = [
        { key: "productName", label: "商品名", width: isSM ? "25%" : "15%", truncate: true },
        { key: "sku", label: isSM ? "SKU" : "SKUコード", width: isSM ? "25%" : "15%", align: "center", truncate: true, sortable: true },
        { key: "qty", label: "数量", width: isSM ? "25%" : "10%", align: "center", truncate: true, },
        { key: "price", label: isSM ? "単価" : "単価(円)", width: isSM ? "30%" : "15%", align: "center", truncate: true, hideOnMobile: true },
        { key: "subtotal", label: isSM ? "小計" : "小計(円)", width: "15%", align: "center", hideOnMobile: true },
        { key: "status", label: "ステータス", width: isSM ? "25%" : "15%", align: "center", truncate: true },
    ];


    // 注文詳細の初期セット
    useEffect(() => {
        if (data?.details) {
            setDetails(data.details);
        }
        if (data?.description) {
            setDescription(data.description);
        }
    }, [data?.details, data?.description]);

    // 合計金額計算
    const totalAmount = useMemo(() => {
        return details.reduce((sum, item) => sum + item.qty * item.price, 0);
    }, [details]);

    // 保存処理
    const handleSave = async () => {
        try {
            await descriptionSchema.validate({ description }, { abortEarly: false });
            const updatedData: SaleOrderData = {
                ...data!,
                details: details,
                description: description,
            };
            await saleAPI.updateSalesOrderQuantityAndDescription(Number(soId), updatedData);
            showSnackbar(SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success");
            setIsEditing(false);
            setDescriptionError(null);
        } catch (err: unknown) {
            if (err instanceof yup.ValidationError) {
                setDescriptionError(err.message);
            }
            showSnackbar(SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        }
    };

    // 削除処理
    const deleteMutation = useMutation({
        mutationFn: async () => saleAPI.deleteSellOrder(Number(soId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["sell-order-detail"] });
            setTimeout(() => {
                navigate("/sell-order");
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleDelete = async () => {
        const ok = await confirmDelete(
            `販売アイテム「${soId}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate();
        }
    }

    // 受注処理
    const submitMutation = useMutation({
        mutationFn: async () => saleAPI.prepareSaleOrder(Number(soId)),
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.SELL.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["sell-order-detail"] });
            setTimeout(() => {
                navigate("/sell-order");
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.SELL.CREATE_FAILED, "error");
        }
    });

    const createdAt = data?.createdAt ? new Date(data?.createdAt ?? "").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    }) : "";
    return (
        <Box mx={3} mb={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header
                        title={`注文番号: ${data?.id ?? ""}`}
                        subtitle={`ステータス: ${data?.status ?? ""} | 作成日: ${createdAt}`}
                    />
                )}
                <Box mt={4}>
                    <Tooltip title="元に戻す">
                        <IconButton aria-label="元に戻す" color='info' onClick={() => {
                            navigate("/sell-order");
                        }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box mt={3} height="75vh">
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table
                            sx={{
                                tableLayout: "fixed",
                                ...styledTable(colors),
                            }}
                        >
                            <colgroup>
                                {columns.map(
                                    (col) => (!isSM || !col.hideOnMobile ? <col key={col.key} style={{ width: col.width }} /> : null)
                                )}
                            </colgroup>
                            <TableHead>
                                <TableRow>
                                    {columns.map(col => !isSM || !col.hideOnMobile ? (
                                        <TableCell
                                            key={col.key}
                                            sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}
                                        >
                                            {col.label}
                                        </TableCell>
                                    ) : null)}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {/* 注文行 */}
                                {(rows.length > 0) ? (
                                    rows.map((row, index) => (
                                        <TableRow key={row.id}>
                                            {columns.map(col => {
                                                if (isSM && col.hideOnMobile) return null;
                                                let displayContent: React.ReactNode;
                                                let tooltipText: string = "";
                                                switch (col.key) {
                                                    case "qty":
                                                        displayContent = isEditing ? (
                                                            <TextField
                                                                type="number"
                                                                value={row.qty}
                                                                onChange={(e) => {
                                                                    const newQty = Number(e.target.value);
                                                                    const newDetails = [...details];
                                                                    newDetails[index].qty = newQty;
                                                                    setDetails(newDetails);
                                                                }}
                                                                size="small"
                                                                autoFocus={index === 0}
                                                                slotProps={{
                                                                    input: {
                                                                        inputProps: { min: 0 },
                                                                    },
                                                                }}
                                                            />
                                                        ) : (data?.status === "NEW" ? row.qty : `${row.deliveredQty || 0}/${row.qty}`);
                                                        break;
                                                    case "status":
                                                        displayContent = renderStatusChip(row.status);
                                                        tooltipText = row.status;
                                                        break;
                                                    case "subtotal":
                                                        displayContent = `¥${row.subtotal.toLocaleString()}`;
                                                        break;
                                                    default:
                                                        displayContent = row[col.key as keyof typeof row];
                                                        tooltipText = String(displayContent ?? "");
                                                }
                                                return (
                                                    <TableCell key={col.key} sx={cellStyle(col.align as "right" | "center" | undefined, col.truncate)}>
                                                        {tooltipText ? (
                                                            <Tooltip title={tooltipText}>
                                                                <span>{displayContent}</span>
                                                            </Tooltip>
                                                        ) : (
                                                            displayContent
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            該当する商品がありません
                                        </TableCell>
                                    </TableRow>
                                )}
                                {/* 合計金額 */}
                                <TableRow>
                                    <TableCell colSpan={isSM ? 3: 5} align="right" sx={{ fontWeight: 'bold' }}>
                                        合計金額:
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {totalAmount} 円
                                    </TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {/* 注文説明 */}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={200} />
                ) : (
                    <Box mt={2} mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} mb={2}>
                            注文説明:
                        </Typography>
                        {isEditing ? (
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                }}
                                error={!!descriptionError}
                                helperText={descriptionError}
                                sx={{
                                    backgroundColor: colors.primary[800],
                                }}
                            />
                        ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {description || "説明なし"}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
            {/* 操作ボタン */}
            <Stack
                direction="row"
                spacing={2}
            >
                {/* 編集・保存 */}
                {(data?.status === 'NEW' && !isWarehouse) && (isEditing ? (
                    <Button variant="contained" color="success" onClick={() => handleSave()}>
                        保存
                    </Button>
                ) : (
                    <Button variant="contained" color="secondary" onClick={() => setIsEditing(!isEditing)}>
                        編集
                    </Button>

                ))}
                {/* 削除ボタン */}
                <Tooltip title={isWarehouse ? "管理者またはスタッフのみ削除可能" : ""} arrow>
                    <span>
                        <Button disabled={isWarehouse} variant="contained" color="error" onClick={() => handleDelete()}>
                            削除
                        </Button>
                    </span>
                </Tooltip>
                {/* 受注ボタン */}
                {data?.status === 'NEW' && (
                    <Tooltip title={isWarehouse ? "管理者またはスタッフのみ受注可能" : ""} arrow>
                        <span>
                            <Button disabled={isWarehouse} variant="contained" color="info" onClick={() => setOpenSubmitConfirm(true)}>
                                受注
                            </Button>
                        </span>
                    </Tooltip>
                )}
                {/* 出荷ボタン */}
                {(data?.status === 'PENDING' || data?.status === 'PROCESSING') && (
                    <Tooltip title={isStaff ? "管理者またはスタッフのみ出荷可能" : ""} arrow>
                        <span>
                            <Button disabled={isStaff} variant="contained" color="info" onClick={() => navigate(`/sell-order/${soId}/deliver`)}>
                                出荷
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </Stack>
            {/* 受注確認ダイアログ */}
            <SubmitConfirmDialog
                open={openSubmitConfirm}
                onClose={() => setOpenSubmitConfirm(false)}
                targetName={soId}
                onConfirm={() => submitMutation.mutate()}
                isPending={submitMutation.isPending}
                type="受注"
            />
        </Box>
    )
}

export default SellOrderDetailPage