import {
    Box,
    Button,
    Checkbox,
    Collapse,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Tooltip,
    Typography,
    useTheme,
    type SelectChangeEvent
} from "@mui/material"
import Header from "../../shared/components/layout/Header"
import { tokens } from "../../shared/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { ProductStockData, SupplierProductStockData } from "../stocks/types/stock";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { productAPI } from "./api/productAPI";
import { useStockWithSupplier } from "../stocks/hooks/useStockWithSupplier";
import { styledSelect } from "../../shared/components/global/select/styledSelect";
import { styledTable } from "../../shared/styles/StyleTable";
import AddCardIcon from '@mui/icons-material/AddCard';
import ProductForm from "./components/ProductForm";
import { useScreen } from "../../shared/hooks/ScreenContext";
import SearchBar from "../../shared/components/global/SearchBar";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";
import { TablePaginationActions } from "../../shared/components/pagination/PaginationAction";
import { useAddProduct } from "./hooks/useAddProduct";
import { getCommonSlotProps } from "../../shared/components/pagination/TablePaginationHelper";
import { getCommonMenuProps } from "../../shared/components/global/select/SelectHelper";

/**
 * 在庫テーブルの1行コンポーネント
 *
 * - メイン行に商品情報、在庫数、ステータスなどを表示
 * - Collapse 行で仕入先ごとの SKU 在庫詳細を表示
 *
 * @param props
 * @param {InventoryByProduct} props.row - 行に表示する商品と在庫情報
 * @param {(product: ProductStockData) => void} props.onDelete - 削除ボタン押下時のコールバック
 */

type StockInfo = {
    stockId: number;
    warehouseName: string;
    quantity: number;
    reservedQty: number;
    sku: string;
}

type InventoryByProduct = {
    productName: string;
    totalQuantity: number;
    product: ProductStockData;
    supplierProduct: SupplierProductStockData[];
    stockInfo: StockInfo[];
}

export type Order = 'asc' | 'desc';

type Status = 'ACTIVE' | 'INACTIVE' | "";


function Row(props: { row: InventoryByProduct, onDelete: (product: ProductStockData) => void; }) {

    const { row, onDelete } = props;
    const { isMD } = useScreen(); // 画面サイズ判定

    const [open, setOpen] = useState(false); // Collapseの開閉状態

    const navigate = useNavigate();
    return (
        <Fragment>
            {/** メイン行: 商品情報、合計在庫、ステータス、アクションボタン */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                {!isMD && <TableCell>
                    {/** Collapse 開閉ボタン */}
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        disabled={
                            !row.supplierProduct ||
                            row.supplierProduct.some(sp => !sp.supplierSku || !sp.supplierName)
                        }
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>}
                {/** 詳細 / 削除ボタン */}
                <TableCell>{row.product.productCode}</TableCell>
                {!isMD && <TableCell
                    sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <Tooltip title={row.product.name}>
                        <span>{row.product.name}</span>
                    </Tooltip>
                </TableCell>}
                <TableCell>{row.product.status}</TableCell>
                <TableCell>{row.totalQuantity}</TableCell>
                {!isMD && <TableCell>{row.product.categoryName}</TableCell>}
                <TableCell>
                    <Stack direction="row">
                        <Tooltip title="詳細">
                            <IconButton
                                aria-label="see-more"
                                size="small"
                                sx={{
                                    '&:hover': {
                                        color: "green",
                                    },
                                }}
                                onClick={() => navigate(`/products/${row.product.id}`)}
                            >
                                <VisibilityIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
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
                                    onDelete(row.product)
                                }}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </TableCell>
            </TableRow>
            {/* Collapse行: 仕入先ごとのSKU在庫情報 */}
            <TableRow >
                <TableCell
                    style={{
                        padding: 0,
                    }}
                    colSpan={isMD ? 4 : 7}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 1 }}>
                            <Typography
                                fontSize={10}
                                gutterBottom
                                component="div"
                                textAlign="center"
                            >
                                商品は、異なる仕入先がそれぞれ異なるSKUを提供するため、複数のSKUを持つことがあります。
                            </Typography>
                            {/** 仕入先ごとのSKUテーブル */}
                            <Table
                                size="small"
                                aria-label="purchases"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>SKU</TableCell>
                                        <TableCell>仕入先</TableCell>
                                        <TableCell>在庫数</TableCell>
                                        <TableCell align="right">仕入れ単価</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.supplierProduct.map((supplierProduct) => {
                                        /** SKUごとの在庫合計 */
                                        const totalQuantity = row.stockInfo
                                            .filter(stock => stock.sku === supplierProduct.supplierSku
                                            ).reduce((sum, s) => sum + s.quantity, 0);
                                        return (
                                            <TableRow key={supplierProduct.supplierSku}>
                                                <TableCell component="th" scope="row">
                                                    {supplierProduct.supplierSku ?? '-'}
                                                </TableCell>
                                                <TableCell>{supplierProduct.supplierName ?? '-'}</TableCell>
                                                <TableCell>{totalQuantity}</TableCell>
                                                <TableCell align="right">{supplierProduct.currentPrice}</TableCell>

                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}

const AllProductsPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { isMD, isSM } = useScreen();  // 画面サイズ判定

    // フィルターや選択状態のstate
    const [categoryNames, setCategoryNames] = useState<string[]>([]);
    const [selectedQty, setSelectedQty] = useState<number | "">("");
    const [selectedStatus, setSelectedStatus] = useState<Status>("");
    const [searchText, setSearchText] = useState<string>("");

    // フィルター用の一時state（Drawerでのキャンセル操作対応）
    const [tempCategoryNames, setTempCategoryNames] = useState<string[]>([]);
    const [tempQty, setTempQty] = useState<number | "">("");
    const [tempStatus, setTempStatus] = useState<Status>("");

    // スナックバー表示用カスタムフック
    const { showSnackbar } = useSnackbar();

    const queryClient = useQueryClient();
    const { confirmDelete } = useDialogs();

    // ページネーション
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // ソート用state
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<'code' | 'name' | 'qty'>('code');

    const [openAddProductForm, setOpenAddProductForm] = useState(false);
    const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

    // 在庫データ取得
    const { isLoading, error, data } = useStockWithSupplier();

    // 商品追加Mutation
    const addMutation = useAddProduct(showSnackbar);
    // 商品削除Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => productAPI.deleteProduct(id),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["stock-with-supplier"] });
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    // 削除処理
    const handleDelete = async (product: ProductStockData) => {
        const ok = await confirmDelete(
            `商品「${product.name}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate(Number(product.id));
        }
    }

    // ページ切り替え
    const handleChangePage = (
        _: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    // 行数変更
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // カテゴリ選択変更
    const handleChangeCategories = (event: SelectChangeEvent<typeof categoryNames>) => {
        const {
            target: { value },
        } = event;
        const CLEAR = "__CLEAR__";
        const values =
            typeof value === 'string' ? value.split(',') : value;
        if (value.includes(CLEAR)) {
            setCategoryNames([]);
            return;
        }
        setCategoryNames(values.filter(v => v !== ""));
    };

    // フィルタDrawerを開く
    const handleOpenDrawer = () => {
        setTempCategoryNames(categoryNames);
        setTempQty(selectedQty);
        setTempStatus(selectedStatus);
        setOpenFilterDrawer(true);
    };

    // データ整形: productIdごとにまとめる
    const inventoryByProduct: InventoryByProduct[] = Object.values(
        (data?.stockProducts ?? []).reduce((acc, stock) => {
            const productId = stock.product.id;
            if (!acc[productId]) {
                acc[productId] = {
                    productName: stock.product.name,
                    totalQuantity: 0,
                    product: stock.product,
                    supplierProduct: [],
                    stockInfo: [],
                };
            };
            // 個別在庫情報を追加
            acc[productId].stockInfo.push({
                stockId: stock.id,
                warehouseName: stock.warehouseName,
                quantity: stock.quantity,
                reservedQty: stock.reservedQuantity,
                sku: stock.sku
            });
            // 合計数量更新
            acc[productId].totalQuantity += stock.quantity;
            const exists = acc[productId].supplierProduct
                .some(existSupplierProduct =>
                    existSupplierProduct.supplierSku === stock.sku
                );
            // supplierProductの重複チェック
            if (!exists) {
                acc[productId].supplierProduct.push({
                    currentPrice: stock.supplierProduct?.currentPrice ?? 0,
                    id: stock.supplierProduct?.id ?? null,
                    leadTime: stock.supplierProduct?.leadTime ?? null,
                    productId: Number(stock.product.id),
                    productName: stock.product.name,
                    status: stock.supplierProduct?.status ?? null,
                    supplierId: stock.supplierProduct?.supplierId ?? null,
                    supplierName: stock.supplierProduct?.supplierName ?? null,
                    supplierSku: stock.supplierProduct?.supplierSku ?? null,
                });
            }
            return acc;
        }, {} as Record<string, InventoryByProduct>)
    );

    // 検索フィルター
    const filterdInventoryBySearch = inventoryByProduct.filter(item => {
        if (searchText) {
            return (
                item.product.name.toLowerCase().includes(searchText.toLowerCase()))
        }
        return true;
    });

    // カテゴリフィルター
    const filteredInventoryByCategories = filterdInventoryBySearch.filter(item =>
        categoryNames.length === 0 || categoryNames.includes(item.product.categoryName)
    );

    // 数量・ステータスフィルター
    const filteredInventoryByQtyAndStatus =
        filteredInventoryByCategories
            .filter(item => {
                if (selectedQty !== null) {
                    const totalQuantity = item.stockInfo.reduce((sum, stock) => sum + stock.quantity, 0);
                    if (totalQuantity < Number(selectedQty)) return false;
                }

                if (selectedStatus !== "") {
                    if (item.product.status !== selectedStatus) return false;
                }

                return true;
            });

    const filteredInventories = filteredInventoryByQtyAndStatus;

    // フィルター結果の件数が変わった場合、ページを先頭（0ページ目）にリセットする
    useEffect(() => {
        setPage(0);
    }, [filteredInventories.length]);
    // ページネーション用の空行数
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredInventories.length - page * rowsPerPage);

    // ソート済みデータ
    const sortedFilteredInventories = useMemo(() => {
        return [...filteredInventories].sort((a, b) => {
            let valA, valB;
            if (orderBy === 'code') {
                valA = a.product.productCode;
                valB = b.product.productCode;
            } else if (orderBy === 'qty') {
                valA = a.stockInfo.reduce((sum, s) => sum + s.quantity, 0);
                valB = b.stockInfo.reduce((sum, s) => sum + s.quantity, 0);
            } else if (orderBy === 'name') {
                valA = a.product.name;
                valB = b.product.name;
            } else {
                return 0;
            }

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredInventories, order, orderBy]);


    return (
        <Box mx={3} mb={3}>
            {/** ヘッダーと追加ボタン */}
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    !isSM && <Header
                        title="商品一覧"
                        subtitle="商品情報の一覧表示"
                    />
                )}
                {/** 商品追加ボタン */}
                <Box mt={4}>
                    <Tooltip title="追加">
                        <IconButton
                            color="success"
                            aria-label="追加"
                            onClick={() => {
                                setOpenAddProductForm(true)
                            }}>
                            <AddCardIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/** メインコンテンツ領域 */}
            <Box
                minHeight="75vh"
                height="auto"
            >

                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={80} />
                ) : (
                    <Stack direction="row" justifyContent="space-between" >
                        {/** フィルターセクション */}
                        {isMD ? (
                            // 小画面はDrawer開閉ボタンのみ
                            <IconButton
                                color="primary"
                                onClick={handleOpenDrawer}
                                aria-label="フィルター"
                            >
                                <FilterListIcon />
                            </IconButton>
                        ) : (
                            // 大画面はインラインでフィルター表示
                            <Stack direction="row" gap={1}>

                                {/** カテゴリー選択 */}
                                <FormControl sx={{ m: 1, ml: 0, width: { lg: 150, xs: 120 } }}>
                                    <InputLabel
                                        id="multiple-categories-label"
                                        sx={{
                                            color: colors.grey[100],
                                            '&.Mui-focused': {
                                                color: colors.grey[200],
                                            },
                                        }}
                                    >
                                        カテゴリー
                                    </InputLabel>
                                    <Select
                                        labelId="multiple-categories-label"
                                        id="multiple-categories"
                                        multiple
                                        value={categoryNames}
                                        onChange={handleChangeCategories}
                                        input={<OutlinedInput label="カテゴリー" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        sx={styledSelect}
                                        MenuProps={getCommonMenuProps({
                                            backgroundColor: colors.blueAccent[800],
                                            color: colors.grey[100],
                                        })}
                                    >
                                        <MenuItem value="__CLEAR__">
                                            <em>未選択</em>
                                        </MenuItem>
                                        {data?.categories.map((cat) => (
                                            <MenuItem
                                                key={cat.id}
                                                value={cat.name}
                                            >
                                                <Checkbox
                                                    checked={categoryNames.includes(cat.name)}
                                                    sx={{
                                                        '&.Mui-checked': {
                                                            color: colors.grey[200],
                                                        },
                                                        p: 0,
                                                    }}
                                                />
                                                <Tooltip title={cat.name}>
                                                    <ListItemText
                                                        primary={cat.name}
                                                        slotProps={{
                                                            primary: {
                                                                sx: {
                                                                    maxWidth: { lg: 100, xs: 68 },
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Tooltip>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/** 在庫数フィルター */}
                                <FormControl sx={{ m: 1, width: { lg: 150, xs: 120 } }}>
                                    <InputLabel
                                        id="qty-label"
                                        sx={{
                                            color: colors.grey[100],
                                            '&.Mui-focused': {
                                                color: colors.grey[200],
                                            },
                                        }}
                                    >在庫数</InputLabel>
                                    <Select
                                        labelId="qty-label"
                                        id="qty"
                                        value={selectedQty}
                                        onChange={(e) => {
                                            const value = e.target.value ? e.target.value : "";
                                            if (value === "") {
                                                setSelectedQty(value);
                                            } else setSelectedQty(Number(value));
                                        }}
                                        input={<OutlinedInput label="在庫数" />}
                                        sx={styledSelect}
                                        MenuProps={getCommonMenuProps({
                                            backgroundColor: colors.blueAccent[800],
                                            color: colors.grey[100],
                                        })}
                                    >
                                        <MenuItem value={0}>
                                            <em>未選択</em>
                                        </MenuItem>
                                        <MenuItem value={5}>5以上</MenuItem>
                                        <MenuItem value={10}>10以上</MenuItem>
                                        <MenuItem value={20}>20以上</MenuItem>
                                    </Select>
                                </FormControl>

                                {/** ステータスフィルター */}
                                <FormControl sx={{ m: 1, width: { lg: 150, xs: 120 } }}>
                                    <InputLabel
                                        id="status-label"
                                        sx={{
                                            color: colors.grey[100],
                                            '&.Mui-focused': {
                                                color: colors.grey[200],
                                            },
                                        }}
                                    >ステータス</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        id="status"
                                        value={selectedStatus}
                                        onChange={(e) => {
                                            const value = e.target.value ? e.target.value : "";
                                            setSelectedStatus(value);
                                        }}
                                        input={<OutlinedInput label="ステータス" />}
                                        sx={styledSelect}
                                        MenuProps={getCommonMenuProps({
                                            backgroundColor: colors.blueAccent[800],
                                            color: colors.grey[100],
                                        })}
                                    >

                                        <MenuItem value={0}>
                                            <em>未選択</em>
                                        </MenuItem>
                                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        )}

                        {/** 検索バー */}
                        <SearchBar
                            value={searchText}
                            onChange={setSearchText}
                            sx={{ pr: "0 !important" }}
                        />
                        {/** 小画面用Drawerフィルター */}
                        <Drawer
                            anchor="left"
                            open={openFilterDrawer}
                            onClose={() => setOpenFilterDrawer(false)}

                            slotProps={{
                                paper: {
                                    style: {
                                        width: '80vw',
                                        backgroundColor: colors.primary[400]
                                    }
                                }
                            }}
                        >
                            <Box p={2} display="flex" flexDirection="column" height="100%">
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">フィルター</Typography>
                                    <IconButton onClick={() => setOpenFilterDrawer(false)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                                <Divider sx={{ my: 1 }} />

                                {/** Drawer 内のカテゴリー、在庫数、ステータスフィルター */}
                                <FormControl sx={{ mt: 2 }}>
                                    <InputLabel
                                        sx={{
                                            color: colors.grey[100],
                                            '&.Mui-focused': {
                                                color: colors.grey[200],
                                            },
                                        }}
                                    >
                                        カテゴリー
                                    </InputLabel>
                                    <Select
                                        multiple
                                        value={tempCategoryNames}
                                        onChange={(e) => {
                                            const CLEAR = "__CLEAR__";
                                            const value = e.target.value;
                                            const values =
                                                typeof value === "string" ? value.split(",") : value;

                                            if (values.includes(CLEAR)) {
                                                setTempCategoryNames([]);
                                                return;
                                            }

                                            setTempCategoryNames(values);
                                        }}
                                        input={<OutlinedInput label="カテゴリー" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        MenuProps={getCommonMenuProps({
                                            backgroundColor: colors.primary[600],
                                            color: colors.grey[100],
                                        })}
                                    >
                                        <MenuItem value="__CLEAR__">
                                            <em>未選択</em>
                                        </MenuItem>
                                        {data?.categories.map(cat => (
                                            <MenuItem key={cat.id} value={cat.name}>
                                                <Checkbox checked={tempCategoryNames.includes(cat.name)} />
                                                <ListItemText primary={cat.name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl sx={{ mt: 2 }}>
                                    <InputLabel
                                        sx={{
                                            color: colors.grey[100],
                                            '&.Mui-focused': {
                                                color: colors.grey[200],
                                            },
                                        }}
                                    >
                                        在庫数
                                    </InputLabel>
                                    <Select
                                        value={tempQty}
                                        input={<OutlinedInput label="在庫数" />}
                                        onChange={(e) => setTempQty(Number(e.target.value))}
                                        MenuProps={getCommonMenuProps({
                                            backgroundColor: colors.primary[600],
                                            color: colors.grey[100],
                                        })}
                                    >
                                        <MenuItem value={0}><em>未選択</em></MenuItem>
                                        <MenuItem value={5}>5以上</MenuItem>
                                        <MenuItem value={10}>10以上</MenuItem>
                                        <MenuItem value={20}>20以上</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl sx={{ mt: 2 }}>
                                    <InputLabel
                                        sx={{
                                            color: colors.grey[100],
                                            '&.Mui-focused': {
                                                color: colors.grey[200],
                                            },
                                        }}
                                    >
                                        ステータス
                                    </InputLabel>
                                    <Select
                                        value={tempStatus}
                                        onChange={(e) => {
                                            const value = e.target.value ? e.target.value : ""
                                            setTempStatus(value)
                                        }}
                                        input={<OutlinedInput label="ステータス" />}
                                        MenuProps={getCommonMenuProps({
                                            backgroundColor: colors.primary[600],
                                            color: colors.grey[100],
                                        })}
                                    >
                                        <MenuItem value={0}><em>未選択</em></MenuItem>
                                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                    </Select>
                                </FormControl>

                                {/** Drawer フィルターの下部ボタン */}
                                <Box mt="auto" display="flex" justifyContent="right" gap={2} py={2}>
                                    <Button variant="contained" color="warning" onClick={() => setOpenFilterDrawer(false)}>キャンセル</Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setCategoryNames(tempCategoryNames);
                                            setSelectedQty(tempQty);
                                            setSelectedStatus(tempStatus as Status);
                                            setOpenFilterDrawer(false);
                                        }}
                                    >
                                        適用
                                    </Button>
                                </Box>
                            </Box>
                        </Drawer>
                    </Stack>
                )}

                {/** 商品テーブル */}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Box mt={1} display="flex" flexDirection={{ xs: 'column', xl: 'row' }}  >
                        <TableContainer component={Paper} sx={{ height: "100%", minWidth: { xs: 308, md: 600 } }}>
                            <Table
                                sx={{
                                    tableLayout: "fixed",
                                    ...styledTable(colors),
                                }}
                            >
                                {/** カラム幅調整 */}
                                <colgroup>
                                    {!isMD && <col style={{ width: "6%" }} />}
                                    <col style={{ width: "28%" }} />
                                    {!isMD && <col style={{ width: "30%" }} />}
                                    <col style={{ width: "30%" }} />
                                    <col style={{ width: "20%" }} />
                                    {!isMD && <col style={{ width: "15%" }} />}
                                    <col style={{ width: "22%" }} />
                                </colgroup>
                                {/** テーブルヘッダー */}
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            '& > th': {
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            },
                                        }}
                                    >
                                        {!isMD && <TableCell />}
                                        <TableCell
                                            sortDirection={orderBy === 'code' ? order : false}
                                        >
                                            <TableSortLabel
                                                active={orderBy === 'code'}
                                                direction={orderBy === 'code' ? order : 'asc'}
                                                onClick={() => {
                                                    const isAsc = orderBy === 'code' && order === 'asc';
                                                    setOrder(isAsc ? 'desc' : 'asc');
                                                    setOrderBy('code');
                                                }}
                                            >

                                                コード
                                            </TableSortLabel>
                                        </TableCell>
                                        {!isMD && <TableCell sortDirection={orderBy === 'name' ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === 'name'}
                                                direction={orderBy === 'name' ? order : 'asc'}
                                                onClick={() => {
                                                    const isAsc = orderBy === 'name' && order === 'asc';
                                                    setOrder(isAsc ? 'desc' : 'asc');
                                                    setOrderBy('name')
                                                }}
                                            >
                                                商品名
                                            </TableSortLabel>
                                        </TableCell>}
                                        <TableCell>ステータス</TableCell>
                                        <TableCell sortDirection={orderBy === 'qty' ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === 'qty'}
                                                direction={orderBy === 'qty' ? order : 'asc'}
                                                onClick={() => {
                                                    const isAsc = orderBy === 'qty' && order === 'asc';
                                                    setOrder(isAsc ? 'desc' : 'asc');
                                                    setOrderBy('qty');
                                                }}
                                            >
                                                在庫数
                                            </TableSortLabel>
                                        </TableCell>
                                        {!isMD && <TableCell>カテゴリー</TableCell>}
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedFilteredInventories
                                        .slice(
                                            page * rowsPerPage,
                                            rowsPerPage > 0 ? page * rowsPerPage + rowsPerPage : sortedFilteredInventories.length
                                        ).map(row => (<Row
                                            key={row.product.id}
                                            row={row}
                                            onDelete={(product: ProductStockData) => {
                                                handleDelete(product);
                                            }}
                                        />))
                                    }
                                    {/** 空行の埋め合わせ */}
                                    {emptyRows > 0 && (
                                        <TableRow
                                            style={{
                                                height: emptyRows * 48.56,
                                            }}
                                        >
                                            <TableCell colSpan={isMD ? 4 : 7} />
                                        </TableRow>
                                    )}
                                    {/** データがない場合 */}
                                    {filteredInventories.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={isMD ? 4 : 7} align="center">
                                                該当する商品がありません
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                {/** ページネーション */}
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10,]}
                                            colSpan={isMD ? 4 : 7}
                                            count={filteredInventories.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            slotProps={getCommonSlotProps(isSM)}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            ActionsComponent={TablePaginationActions}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* 新規商品追加フォーム */}
                {openAddProductForm && (
                    <ProductForm
                        open
                        onClose={() => setOpenAddProductForm(false)}
                        onSubmit={(data) => {
                            addMutation.mutate(data)
                        }}
                        categories={data?.categories ?? []}
                    />
                )}
            </Box >
        </Box >
    )
}

export default AllProductsPage