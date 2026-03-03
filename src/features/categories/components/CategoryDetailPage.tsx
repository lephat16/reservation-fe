import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Collapse,
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
    Typography,
    useTheme
} from "@mui/material";
import { tokens } from "../../../shared/theme";
import Header from "../../../shared/components/layout/Header";
import type { CategoryData, CategoryFormData, ProductStockData } from "../types/category";
import { useState } from "react";
import { useParams } from "react-router-dom";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ErrorState from "../../../shared/components/messages/ErrorState";
import { useInfoCategory } from "../hooks/useInfoCategory";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from "../../../shared/hooks/SnackbarContext";
import { useDeleteCategory } from "../hooks/useDeleteCategory";
import CategoryForm from "./CategoryForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryAPI } from "../api/categoryAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { styledTable } from "../../../shared/styles/StyleTable";
import { STATUS } from "../../../constants/status";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useDialogs } from "../../../shared/hooks/dialogs/useDialogs";
/**
 * カテゴリー詳細ページ
 *
 * 指定カテゴリーの情報、関連商品の在庫情報、仕入先情報を表示。
 * カテゴリー編集・削除操作も可能。
 */

interface ProductRowProps {
    product: ProductStockData;
}

function ProductRow({ product }: ProductRowProps) {

    const [open, setOpen] = useState(false);

    // 合計在庫数を計算
    const totalStock =
        product.stocks?.reduce((sum, s) => sum + s.quantity, 0) ?? 0;

    return (
        <>
            {/* メイン行 */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        size="small"
                        onClick={() => setOpen(!open)}
                        aria-label={open ? "折りたたむ" : "展開する"}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell>{product.productName}</TableCell>

                <TableCell>
                    {product.suppliers.length} 件
                </TableCell>

                <TableCell sx={{ borderBottom: 'none' }} align="right">{totalStock}</TableCell>
            </TableRow>

            {/* 展開行：仕入先・在庫詳細 */}
            <TableRow >
                <TableCell colSpan={4} style={{ padding: 0 }} >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box display="flex" >

                            {/* 仕入先テーブル */}
                            <Table
                                size="small"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">仕入先名</TableCell>
                                        <TableCell align="center">仕入単価</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {product.suppliers.map(s => (
                                        <TableRow key={s.supplierName}>
                                            <TableCell align="center">{s.supplierName}</TableCell>
                                            <TableCell align="center">
                                                ¥{s.price.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* 在庫テーブル */}
                            {(product.stocks && product.stocks.length > 0) ? (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">倉庫</TableCell>
                                            <TableCell align="center">在庫数</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {product.stocks.map((st, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell align="center">{st.warehouse}</TableCell>
                                                <TableCell align="center">{st.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">倉庫</TableCell>
                                            <TableCell align="center">在庫数</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                在庫なし
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

/**
 * カテゴリー詳細ページ
 */
const CategoryDetailPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { categoryId } = useParams<{ categoryId: string }>();

    const [openEditCategoryForm, setOpenEditCategoryForm] = useState(false);

    const { showSnackbar } = useSnackbar();
    const { confirmDelete } = useDialogs();
    const queryClient = useQueryClient();

    const [showMore, setShowMore] = useState(false);

    // カテゴリー情報取得カスタムフック
    const { isLoading, error, data } = useInfoCategory(Number(categoryId));

    const categoryImageUrl = data?.categoryInfo.imageUrl
        ? data.categoryInfo.imageUrl.startsWith("/uploads")
            ? `${import.meta.env.VITE_IMG_URL}${data.categoryInfo.imageUrl}`
            : data.categoryInfo.imageUrl
        : import.meta.env.VITE_DEFAULT_CATEGORY_IMG;

    // カテゴリー更新用Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
            return categoryAPI.updateCategory(id, data);
        },
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.UPDATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["category"] });
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.UPDATE_FAILED, "error");
        }
    });

    // カテゴリー削除処理
    const deleteMutation = useDeleteCategory(showSnackbar);
    const handleDelete = async (category: CategoryData) => {
        const ok = await confirmDelete(
            `ユーザー「${category.name}」を削除しますか？`
        );

        if (ok) {
            deleteMutation.mutate(Number(categoryId));
        }
    }

    // 商品に関連するすべての仕入先名を取得
    const getAllSuppliers = (products?: ProductStockData[]): string => {
        if (!products || products.length === 0) return "";
        const suppliers = products.flatMap(p =>
            p.suppliers?.map(s => s.supplierName) ?? []
        );

        return Array.from(new Set(suppliers)).join(", ");
    };
    const mappedCategoryFormData: CategoryFormData = {
        name: data?.categoryInfo.name ?? '',
        status: data?.categoryInfo.status ?? 'INACTIVE',
        description: data?.categoryInfo.description ?? '',
        imageUrl: data?.categoryInfo.imageUrl ?? null,
    }
    return (
        <Box mx={3} mb={3}>
            {/* ヘッダー表示 */}
            {isLoading ? (
                <Skeleton variant="text" width="80%" height={40} />
            ) : (
                <Header
                    title={`カテゴリ: ${data?.categorySummary?.categoryName ?? ""}`}
                    subtitle={`仕入先: ${getAllSuppliers(data?.categorySummary?.products)}`}
                />
            )}
            <Box m="40px 0 0 0" minHeight="75vh">

                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                {/* カテゴリー情報表示 */}
                {data && (
                    <>
                        {isLoading ? (
                            <Skeleton variant="rectangular" height={250} sx={{ mb: 2 }} />
                        ) : (
                            <Card
                                sx={{
                                    display: 'flex',
                                    mb: 2,
                                    backgroundColor: colors.primary[400],
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}>

                                {/* カテゴリー情報 */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1,
                                    }}>
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography
                                            component="div"
                                            variant="h5"
                                            sx={{ fontWeight: 'bold', mb: 1 }}
                                        >
                                            {data.categoryInfo.name}
                                        </Typography>

                                        {/* ステータス・編集・削除ボタン */}
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} mt={1}>
                                            <Chip
                                                label={STATUS[data.categoryInfo.status].label}
                                                color={STATUS[data.categoryInfo.status].color}
                                                size="small"
                                                sx={{ mb: 1 }}
                                            />
                                            <Tooltip title="削除">
                                                <IconButton
                                                    aria-label="delete"
                                                    size="small"
                                                    sx={{
                                                        '&:hover': {
                                                            color: "red",
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        if (data.categoryInfo) {
                                                            handleDelete(data.categoryInfo)
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="編集">
                                                <IconButton
                                                    aria-label="edit"
                                                    size="small"
                                                    sx={{
                                                        '&:hover': {
                                                            color: "orange",
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        setOpenEditCategoryForm(true)
                                                    }}
                                                >
                                                    <EditIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>

                                        {/* 説明文 */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                mb: 1,
                                                display: '-webkit-box',
                                                WebkitLineClamp: showMore ? 'none' : 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowMore(!showMore)}
                                        >
                                            {data.categoryInfo.description}
                                        </Typography>

                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            作成日: {data.categoryInfo.createdAt ? new Date(data.categoryInfo.createdAt).toLocaleDateString() : '-'}
                                        </Typography>

                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            更新日: {data.categoryInfo.updatedAt ? new Date(data.categoryInfo.updatedAt).toLocaleDateString() : '-'}
                                        </Typography>
                                    </CardContent>
                                </Box>

                                {/* カテゴリー画像 */}
                                <CardMedia
                                    component="img"
                                    sx={{ width: 180, height: 180, objectFit: 'cover' }}
                                    image={categoryImageUrl}
                                    alt={data.categoryInfo.name}
                                />
                            </Card>
                        )}

                        {/* 商品テーブル */}
                        {isLoading ? (
                            <Skeleton variant="rectangular" height={400} />
                        ) : (
                            <TableContainer component={Paper} sx={{ height: "100%" }}>
                                <Table
                                    stickyHeader
                                    sx={{
                                        ...styledTable(colors)
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>商品</TableCell>
                                            <TableCell>仕入先</TableCell>
                                            <TableCell align="right">在庫合計</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {(data?.categorySummary?.products && data.categorySummary.products.length > 0) ? (
                                            data.categorySummary.products.map(p => (
                                                <ProductRow
                                                    key={p.productName}
                                                    product={p}
                                                />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                    該当する商品がありません
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>

                )}

                {/* カテゴリー編集フォーム */}
                {openEditCategoryForm && (
                    <CategoryForm
                        open
                        category={mappedCategoryFormData}
                        onClose={() => setOpenEditCategoryForm(false)}
                        onSubmit={(formData) => {
                            updateMutation.mutate({
                                id: Number(categoryId),
                                data: formData
                            });

                        }}
                    />
                )}
            </Box>
        </Box>
    )
}

export default CategoryDetailPage;