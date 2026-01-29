import { alpha, Box, Checkbox, Collapse, FormControl, IconButton, InputBase, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, Skeleton, Stack, styled, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar, Tooltip, Typography, useTheme, type SelectChangeEvent } from "@mui/material"
import Header from "../../pages/Header"
import { tokens } from "../../shared/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import { Fragment, useMemo, useState } from "react";
import { TablePaginationActions } from "../stocks/WarehousePage";
import type { ProductStockData, SupplierProductStockData } from "../stocks/types/stock";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { AxiosError } from "axios";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { DeleteConfirmDialog } from "./components/ProductPage";
import { productAPI } from "./api/productAPI";
import { useStockWithSupplier } from "../stocks/hooks/useStockWithSupplier";
import { styledSelect } from "../../shared/styles/styledSelect";
import { styledTable } from "../../shared/components/global/StyleTable";
import AddCardIcon from '@mui/icons-material/AddCard';
import ProductForm from "./components/ProductForm";
import type { ProductFormData } from "./types/product";

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

type Order = 'asc' | 'desc';

type Status = 'ACTIVE' | 'INACTIVE' | "";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));
function Row(props: { row: InventoryByProduct, onDelete: (product: ProductStockData) => void; }) {

    const { row, onDelete } = props;

    const theme = useTheme();
    // const colors = tokens(theme.palette.mode);

    const [open, setOpen] = useState(false);

    const navigate = useNavigate();
    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{row.product.productCode}</TableCell>
                <TableCell>{row.product.name}</TableCell>
                <TableCell>{row.product.status}</TableCell>
                <TableCell>{row.totalQuantity}</TableCell>
                <TableCell>{row.product.categoryName}</TableCell>
                <TableCell>
                    <Stack direction="row">
                        <Tooltip title="削除">
                            <IconButton
                                aria-label="delete"
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
                        <Tooltip title="編集">
                            <IconButton
                                aria-label="edit"
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

            <TableRow>
                <TableCell
                    style={{
                        padding: 0,
                    }}
                    colSpan={7}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 1 }}>
                            <Typography fontSize={10} gutterBottom component="div" textAlign="center">
                                商品は、異なる仕入先がそれぞれ異なるSKUを提供するため、複数のSKUを持つことがあります。
                            </Typography>
                            <Table
                                size="small"
                                aria-label="purchases"
                                sx={{
                                    '& .MuiTableHead-root': {
                                        backgroundColor: theme.palette.mode === 'light' ? '#eaeff5' : '#4a6ba0',
                                        color: theme.palette.mode === 'light' ? '#000' : '#fff',

                                    },
                                }}>
                                <TableHead
                                    sx={{
                                        '& .MuiTableRow-root': {
                                            '&:hover': {
                                                backgroundColor: theme.palette.mode === 'light' ? '#d1e3f1' : '#3c4a6b',
                                            },
                                        },
                                    }}
                                >
                                    <TableRow>

                                        <TableCell>SKU</TableCell>
                                        <TableCell>仕入先</TableCell>
                                        <TableCell>在庫数</TableCell>
                                        <TableCell align="right">仕入れ単価</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.supplierProduct.map((supplierProduct) => (
                                        <TableRow key={supplierProduct.supplierSku}>
                                            <TableCell component="th" scope="row">
                                                {supplierProduct.supplierSku}
                                            </TableCell>
                                            <TableCell>{supplierProduct.supplierName}</TableCell>
                                            <TableCell>
                                                {row.stockInfo
                                                    .filter(stock => stock.sku === supplierProduct.supplierSku
                                                    ).reduce((sum, s) => sum + s.quantity, 0)}
                                            </TableCell>
                                            <TableCell align="right">{supplierProduct.currentPrice}</TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}

const AllProductsPageRefator = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [categoryNames, setCategoryNames] = useState<string[]>([]);
    const [selectedQty, setSelectedQty] = useState<number | "">("");
    const [selectedStatus, setSelectedStatus] = useState<Status>("");
    const [selectedProduct, setSelectedProduct] = useState<ProductStockData | null>(null);
    const [searchText, setSearchText] = useState<string>("");

    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<'code' | 'name' | 'qty'>('code');

    const [openAddProductForm, setOpenAddProductForm] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const { isLoading, error, data } = useStockWithSupplier();

    const addMutation = useMutation({
        mutationFn: async (data: ProductFormData) => productAPI.createProduct(data),
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        }
    })
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => productAPI.deleteProduct(id),
        onSuccess: () => {
            showSnackbar(SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["products-and-categories"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


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
            acc[productId].stockInfo.push({
                stockId: stock.id,
                warehouseName: stock.warehouseName,
                quantity: stock.quantity,
                reservedQty: stock.reservedQuantity,
                sku: stock.sku
            });
            acc[productId].totalQuantity += stock.quantity;
            const exists = acc[productId].supplierProduct
                .some(existSupplierProduct =>
                    existSupplierProduct.supplierSku === stock.sku
                );
            if (!exists) {
                acc[productId].supplierProduct.push({
                    currentPrice: stock.supplierProduct.currentPrice,
                    id: stock.supplierProduct.id,
                    leadTime: stock.supplierProduct.leadTime,
                    productId: Number(stock.product.id),
                    productName: stock.product.name,
                    status: stock.supplierProduct.status,
                    supplierId: stock.supplierProduct.supplierId,
                    supplierName: stock.supplierProduct.supplierName,
                    supplierSku: stock.supplierProduct.supplierSku,
                });
            }
            return acc;
        }, {} as Record<string, InventoryByProduct>)
    );


    const filterdInventoryBySearch = inventoryByProduct.filter(item => {
        if (searchText) {
            return (
                item.product.name.toLowerCase().includes(searchText.toLowerCase()))
        }
        return true;
    });

    const filteredInventoryByCategories = filterdInventoryBySearch.filter(item =>
        categoryNames.length === 0 || categoryNames.includes(item.product.categoryName)
    );

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

    const filteredInventories = filteredInventoryByQtyAndStatus

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredInventories.length - page * rowsPerPage);

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
        <Box m={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header
                        title="商品一覧"
                        subtitle="商品情報の一覧表示"
                    />
                )}
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
            <Box
                mt={1}
                minHeight="75vh"
                height="auto"
            >
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />

                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={80} />
                ) : (
                    <Stack direction="row" justifyContent="space-between" >
                        <Stack direction="row" gap={1}>
                            <FormControl sx={{ m: 1, width: 150, ml: 0 }}>
                                <InputLabel
                                    id="multiple-categories-label"
                                    sx={{
                                        color: colors.grey[100],
                                        '&.Mui-focused': {
                                            color: colors.grey[200],
                                        },
                                    }}
                                >カテゴリー</InputLabel>
                                <Select
                                    labelId="multiple-categories-label"
                                    id="multiple-categories"
                                    multiple
                                    value={categoryNames}
                                    onChange={handleChangeCategories}
                                    input={<OutlinedInput label="カテゴリー" />}
                                    renderValue={(selected) => selected.join(', ')}
                                    sx={styledSelect}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: colors.blueAccent[800],
                                                color: colors.grey[100],
                                                minWidth: 200,
                                                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                                            }
                                        }
                                    }}

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
                                                }}
                                            />
                                            <ListItemText primary={cat.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ m: 1, width: 150 }}>
                                <InputLabel
                                    id="multiple-qty-label"
                                    sx={{
                                        color: colors.grey[100],
                                        '&.Mui-focused': {
                                            color: colors.grey[200],
                                        },
                                    }}
                                >在庫数</InputLabel>
                                <Select
                                    labelId="multiple-qty-label"
                                    id="multiple-qty"
                                    value={selectedQty}
                                    onChange={(e) => {
                                        const value = e.target.value ? e.target.value : "";
                                        if (value === "") {
                                            setSelectedQty(value);
                                        } else setSelectedQty(Number(value));
                                    }}
                                    input={<OutlinedInput label="在庫数" />}
                                    sx={styledSelect}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: colors.blueAccent[800],
                                                color: colors.grey[100],
                                                minWidth: 200,
                                                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                                            }
                                        }
                                    }}

                                >
                                    <MenuItem value={0}>
                                        <em>未選択</em>
                                    </MenuItem>
                                    <MenuItem value={5}>5以上</MenuItem>
                                    <MenuItem value={10}>10以上</MenuItem>
                                    <MenuItem value={20}>20以上</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ m: 1, width: 150 }}>
                                <InputLabel
                                    id="multiple-qty-label"
                                    sx={{
                                        color: colors.grey[100],
                                        '&.Mui-focused': {
                                            color: colors.grey[200],
                                        },
                                    }}
                                >ステータス</InputLabel>
                                <Select
                                    labelId="multiple-qty-label"
                                    id="multiple-qty"
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        const value = e.target.value ? e.target.value : "";
                                        setSelectedStatus(value);
                                    }}
                                    input={<OutlinedInput label="ステータス" />}
                                    sx={styledSelect}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: colors.blueAccent[800],
                                                color: colors.grey[100],
                                                minWidth: 200,
                                                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                                            }
                                        }
                                    }}

                                >
                                    <MenuItem value={0}>
                                        <em>未選択</em>
                                    </MenuItem>
                                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <Toolbar sx={{ pr: "0 !important" }}>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="検索..."
                                    inputProps={{ 'aria-label': 'search' }}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </Search>

                        </Toolbar>
                    </Stack>
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <Box mt={1} display="flex" flexDirection={{ xs: 'column', xl: 'row' }} gap={4} >
                        <TableContainer component={Paper} sx={{ height: "100%", minWidth: 650 }}>
                            <Table
                                sx={{
                                    tableLayout: "fixed",
                                    ...styledTable(theme.palette.mode),
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: "6%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "30%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "10%" }} />
                                </colgroup>
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
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
                                        <TableCell sortDirection={orderBy === 'name' ? order : false}>
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
                                        </TableCell>
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
                                        <TableCell>カテゴリー</TableCell>
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
                                                setOpenDeleteConfirm(true);
                                                setSelectedProduct(product);
                                            }}
                                        />))
                                    }
                                    {emptyRows > 0 && Array.from(Array(emptyRows)).map((_, index) => (
                                        <TableRow key={`empty-${index}`} style={{ height: 53 }}>
                                            <TableCell colSpan={7} />
                                        </TableRow>
                                    ))}
                                    {filteredInventories.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10,]}
                                            colSpan={7}
                                            count={filteredInventories.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            slotProps={{
                                                select: {
                                                    inputProps: {
                                                        'aria-label': 'rows per page',
                                                    },
                                                    native: true,
                                                },
                                            }}
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
                <DeleteConfirmDialog
                    open={openDeleteConfirm}
                    onClose={() => setOpenDeleteConfirm(false)}
                    targetName={selectedProduct?.name}
                    title="商品"
                    onDelete={() => {
                        if (selectedProduct?.id) {
                            deleteMutation.mutate(Number(selectedProduct.id));
                        }
                    }}
                    isDeleting={deleteMutation.isPending}
                />
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
            </Box>
        </Box >
    )
}

export default AllProductsPageRefator