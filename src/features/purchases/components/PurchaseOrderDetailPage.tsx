import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import Header from "../../../shared/components/layout/Header";
import { useNavigate, useParams } from "react-router-dom";
import type { PurchaseOrderData, PurchaseOrderDetailData } from "../types/purchase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokens } from "../../../shared/theme";
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import ErrorState from "../../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { purchaseAPI } from "../api/purchaseAPI";
import { usePurchaseOrderDetail } from "../hooks/usePurchaseOrderDetail";
import { useSumReceivedQtyByPoGroupByProduct } from "../../products/hooks/useSumReceivedQtyByPoGroupByProduct";
import { useScreen } from "../../../shared/hooks/ScreenContext";
import useRoleFlags from "../../auth/hooks/useRoleFlags";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../../shared/hooks/dialogs/useDialogs";

/**
 * 注文確認ダイアログコンポーネント
 *
 * 注文や受注などの確定操作をユーザーに確認するダイアログを表示する
 *
 * @param open - ダイアログの表示・非表示
 * @param onClose - キャンセルボタン押下時のコールバック
 * @param onConfirm - 確定ボタン押下時のコールバック
 * @param type - 操作タイプ（例: "受注" / "発注"）
 * @param targetName - 対象名（例: 注文番号や商品名）、未指定の場合は汎用文言を表示
 * @param isPending - 確定処理中かどうか。true の場合ボタンは無効化され「注文中…」と表示
 */

// Yupスキーマ（説明のバリデーション用）
const descriptionSchema = yup.object({
    description: yup
        .string()
        .required("説明を入力してください")
        .max(500, "説明は500文字以内で入力してください"),
});

interface SubmitConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetName?: string;
    type: string;
    isPending?: boolean;
}

export const SubmitConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    type,
    targetName,
    isPending
}: SubmitConfirmDialogProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: { sx: { backgroundColor: colors.greenAccent[900], borderRadius: 2, p: 2 } }
            }}
        >
            {/* Dialogタイトル */}
            <DialogTitle>確認</DialogTitle>
            {/* Dialog本文 */}
            <DialogContent>
                <Typography>
                    {targetName
                        ? `${targetName}の${type}書を${type}してもよろしいですか？`
                        : "この商品を注文・受注してもよろしいですか？"}
                </Typography>
            </DialogContent>
            {/* Dialogのアクションボタン */}
            <DialogActions>
                <Button variant="contained" color="warning" onClick={onClose}>
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onConfirm}
                    disabled={isPending}
                >
                    {isPending ? "注文中..." : "注文"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

/**
 * 注文詳細ページコンポーネント
 *
 * 特定の注文番号に紐づく商品情報を表示し、
 * 状態に応じて編集、削除、注文、受領の操作を提供する。
 * 
 * 主な機能:
 * - 注文商品一覧の表示（数量、単価、小計、ステータス）
 * - 合計金額計算
 * - 説明の編集および保存
 * - 注文削除、注文確定（NEWステータスの場合）
 * - 受領操作（PENDING / PROCESSINGステータスの場合）
 * - 権限による操作制御（スタッフ・倉庫管理者など）
 * - バリデーション（説明文字数500以内）
 * - Skeletonでロード中表示
 * - エラーハンドリング
 *
 * @component
 */
const PurchaseOrderDetailPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { poId } = useParams<{ poId: string }>(); // URLから注文IDを取得

    const { isStaff, isWarehouse } = useRoleFlags(); // ユーザーの権限フラグ

    // ローカルステート
    const [details, setDetails] = useState<PurchaseOrderDetailData[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);

    const { isSM } = useScreen(); // 画面サイズ判定
    const queryClient = useQueryClient();
    const { confirmDelete } = useDialogs();
    const { showSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック
    const navigate = useNavigate();

    const { isLoading, error, data } = usePurchaseOrderDetail(Number(poId));
    const { isLoading: isLoadingReceivedQty, error: errorReceivedQty, data: dataReceivedQty } =
        useSumReceivedQtyByPoGroupByProduct(Number(poId), data);

    // データ反映
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
        return details.reduce((sum, item) => sum + item.qty * item.cost, 0);
    }, [details]);

    // 保存処理
    const handleSave = async () => {
        try {
            // バリデーションチェック
            await descriptionSchema.validate({ description }, { abortEarly: false });
            const updatedData: PurchaseOrderData = {
                ...data!,
                details: details,
                description: description,
            };
            // API更新
            await purchaseAPI.updatePurchaseOrderQuantityAndDescription(Number(poId), updatedData);
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

    // 削除Mutation
    const deleteMutation = useMutation({
        mutationFn: async () => purchaseAPI.deletePurchaseOrder(Number(poId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchase-order-detail"] });
            setTimeout(() => {
                navigate("/purchase-order");
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });
    const handleDelete = async () => {
        const ok = await confirmDelete(
            `注文のアイテム「${poId}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate();
        }
    }

    // 注文Mutation
    const submitMutation = useMutation({
        mutationFn: async () => purchaseAPI.placePurchaseOrder(Number(poId)),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.ORDER.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["purchase-order-detail"] });
            setTimeout(() => {
                navigate("/purchase-order");
            }, 500);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.ORDER.CREATE_FAILED, "error");
        }
    });

    // 受領数マッピング
    const mappedQty: PurchaseOrderDetailData[] = useMemo(() => {
        return details.map(item => {
            const sumReceived = dataReceivedQty?.find(d => d.sku === item.sku);
            return sumReceived
                ? { ...item, received: sumReceived.receivedQty }
                : item;
        });
    }, [details, dataReceivedQty]);

    return (
        <Box m={3}>
            {/* ヘッダー表示 */}
            {(isLoading || isLoadingReceivedQty) ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                !isSM && <Header
                    title={`注文番号: ${data?.id ?? ""} | 仕入先: ${data?.supplierName ?? ""}`}
                    subtitle={`ステータス: ${data?.status ?? ""} | 作成日: ${data?.createdAt ?? ""}`}
                />
            )}
            <Box mt={3} height="75vh">
                {/* エラー表示 */}
                {(error || errorReceivedQty) && (
                    <ErrorState />
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table sx={{ backgroundColor: colors.primary[400], tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: colors.blueAccent[500],
                                        color: colors.grey[100]
                                    }}
                                >
                                    <TableCell>商品名</TableCell>
                                    <TableCell>SKUコード</TableCell>
                                    <TableCell>数量</TableCell>
                                    <TableCell>単価（円）</TableCell>
                                    <TableCell>小計（円）</TableCell>
                                    <TableCell>ステータス</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(mappedQty.length > 0) ? (
                                    mappedQty.map((detail, index) => {
                                        const subtotal = detail.qty * detail.cost;

                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{detail.productName}</TableCell>
                                                <TableCell>{detail.sku}</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            value={detail.qty}
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
                                                    ) : (data?.status === "NEW"
                                                        ? detail.qty
                                                        : data?.status === "COMPLETED"
                                                            ? `${detail.qty}/${detail.qty}`
                                                            : `${detail.received ?? 0}/${detail.qty}`)
                                                    }
                                                </TableCell>
                                                <TableCell>{detail.cost}</TableCell>
                                                <TableCell>{subtotal}</TableCell>
                                                <TableCell>{detail.status}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                            該当する商品がありません
                                        </TableCell>
                                    </TableRow>
                                )}
                                {/* 合計行 */}
                                <TableRow>
                                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
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
                    <Skeleton variant="text" width="80%" height={40} />
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
                                onChange={(e) => setDescription(e.target.value)}
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
            {/* ボタン群 */}
            <Stack
                direction="row"
                spacing={2}
            >
                {(data?.status === 'NEW' && !isWarehouse) && (isEditing ? (
                    <Button variant="contained" color="success" onClick={() => handleSave()}>
                        保存
                    </Button>
                ) : (
                    <Button variant="contained" color="secondary" onClick={() => setIsEditing(!isEditing)}>
                        編集
                    </Button>

                ))}
                <Tooltip title={isWarehouse ? "管理者またはスタッフのみ削除可能" : ""} arrow>
                    <span>
                        <Button disabled={isWarehouse} variant="contained" color="error" onClick={() => handleDelete()}>
                            削除
                        </Button>
                    </span>
                    {/* 削除ボタン */}
                </Tooltip>
                {data?.status === 'NEW' && (
                    <Tooltip title={isWarehouse ? "管理者またはスタッフのみ注文可能" : ""} arrow>
                        <span>
                            <Button disabled={isWarehouse} variant="contained" color="info" onClick={() => setOpenSubmitConfirm(true)}>
                                注文
                            </Button>
                        </span>
                    </Tooltip>
                )}
                {/* 受領ボタン */}
                {(data?.status === 'PENDING' || data?.status === 'PROCESSING') && (
                    <Tooltip title={isStaff ? "管理者または倉庫管理者のみ受領可能" : ""} arrow>
                        <span>
                            <Button disabled={isStaff} variant="contained" color="info" onClick={() => navigate(`/purchase-order/${poId}/receive`)}>
                                受領
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </Stack>

            {/* 注文確認ダイアログ */}
            <SubmitConfirmDialog
                open={openSubmitConfirm}
                onClose={() => setOpenSubmitConfirm(false)}
                targetName={poId}
                onConfirm={() => submitMutation.mutate()}
                isPending={submitMutation.isPending}
                type="受注"
            />

        </Box >
    )
}

export default PurchaseOrderDetailPage;


