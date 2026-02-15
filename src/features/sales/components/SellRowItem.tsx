import {
    Avatar,
    Box,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import useProductsByCategory from "../../products/hooks/useProductsByCategory";
import type { CategorySummariesData } from "../../categories/types/category";
import { tokens } from "../../../shared/theme";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SellIcon from '@mui/icons-material/Sell';
import InventoryIcon from '@mui/icons-material/Inventory';
import NumberField from "../../../shared/components/fields/NumberField";
import type { SellRow } from "./CreateSellPage";
import { useState } from "react";
import type { ProductWithSkuByCategoryData } from "../../suppliers/types/supplier";
import { descriptionTextField } from "../../../shared/styles/descriptionTextField";
import { styledSelect } from "../../../shared/styles/styledSelect";


type RowErrors = Record<string, string>;

type ItemProps = {
    row: SellRow;
    index: number;
    isLast: boolean;
    totalRows: number;
    categories: CategorySummariesData[];
    customerName: string;
    onUpdate: (index: number, patch: Partial<SellRow>) => void;
    onAdd: () => void;
    onDelete: (index: number) => void;
    errors?: RowErrors;
}

const SellRowItem = ({
    row,
    index,
    isLast,
    totalRows,
    categories,
    customerName,
    onUpdate,
    onAdd,
    onDelete,
    errors
}: ItemProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [selectedProduct, setSelectedProduct] = useState<ProductWithSkuByCategoryData | null>(null)

    const categoryId = row.category?.id;
    const { data: productData = [] } = useProductsByCategory(Number(categoryId));

    const total = row.qty * row.price;
    const totalQuantity = selectedProduct?.totalQuantity ?? 0;        // 在庫数
    const reservedQuantity = selectedProduct?.totalReservedQuantity ?? 0; // 引当済み在庫
    const availableQuantity = totalQuantity - reservedQuantity;       // 利用可能数量
    return (
        <Box
            border={1}
            borderRadius={1}
            p={2}
            pb={4}
            m={1}
            width={374}
            position="relative"
        >
            {/* Category */}

            <FormControl
                fullWidth
                sx={{ mb: 2 }}
                error={!!errors?.category}
            >
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
                    value={categoryId ?? ""}
                    label="カテゴリー"
                    disabled={!customerName.trim()}
                    onChange={(e) =>
                        onUpdate(index, {
                            category: categories.find(c => c.id === Number(e.target.value)) ?? null,
                            productId: null,
                            sku: null,
                        })
                    }
                    sx={styledSelect}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.categoryName}
                        </MenuItem>
                    ))}
                </Select>
                {errors?.category &&
                    <Typography
                        color="error"
                        variant="caption"
                    >
                        {errors.category}
                    </Typography>}
            </FormControl>

            {/* Product */}
            {categoryId && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel
                        sx={{
                            color: colors.grey[100],
                            '&.Mui-focused': {
                                color: colors.grey[200],
                            },
                        }}
                        error={!!errors?.productId}
                    >
                        商品名
                    </InputLabel>
                    <Select
                        value={row.productId ?? ""}
                        label="商品名"
                        onChange={(e) =>
                            onUpdate(index, { productId: Number(e.target.value), sku: null })
                        }
                        sx={styledSelect}
                    >
                        {Array.from(
                            new Map(productData.map(p => [p.productName, p])).values()
                        ).map((p) => {
                            return (
                                <MenuItem key={p.productId} value={p.productId}>
                                    {p.productName}
                                </MenuItem>
                            )
                        })}
                    </Select>
                    {errors?.productId &&
                        <Typography
                            color="error"
                            variant="caption"
                        >
                            {errors.productId}
                        </Typography>}
                </FormControl>
            )}

            {/* SKU */}
            {row.productId && (
                <FormControl
                    fullWidth sx={{ mb: 2 }}
                    error={!!errors?.sku}
                >
                    <InputLabel
                        sx={{
                            color: colors.grey[100],
                            '&.Mui-focused': {
                                color: colors.grey[200],
                            },
                        }}
                    >SKU</InputLabel>
                    <Select
                        value={row.sku ?? ""}
                        label="SKU"
                        onChange={(e) => {
                            const sku = e.target.value;
                            const product = productData.find(p => p.sku === sku) ?? null;
                            setSelectedProduct(product);
                            onUpdate(index, {
                                sku,
                                stockQty: (product?.totalQuantity ?? 0) - (product?.totalReservedQuantity ?? 0),
                                qty: 1,
                                price: 0,
                            });
                        }}
                        sx={styledSelect}
                    >
                        {productData
                            .filter(p => p.productId === row.productId)
                            .map(p => (
                                <MenuItem key={p.supplierProductId} value={p.sku}>
                                    {p.sku}
                                </MenuItem>
                            ))}
                    </Select>
                    {errors?.sku &&
                        <Typography
                            color="error"
                            variant="caption"
                        >
                            {errors.sku}
                        </Typography>}
                </FormControl>
            )}

            {/* Qty & Price */}
            {row.sku && (
                <Box
                    border={1}
                    borderRadius={1}
                    p={2}
                    width="100%"
                    sx={{
                        borderColor: colors.grey[400],
                    }}
                >

                    <Typography variant="h6" textAlign="center" mb={1}>
                        {productData.find(p => p.productId === row.productId)?.productName}
                    </Typography>
                    <Typography variant="h6" textAlign="center">{row.sku}</Typography>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <SellIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={`仕入単価: ${selectedProduct?.price?.toLocaleString() ?? 0} ¥`} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <InventoryIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={`利用可能数量: ${availableQuantity}${selectedProduct?.unit ?? ""}`} />
                        </ListItem>
                    </List>
                    <Box mb={1}>
                        <Stack direction="row" gap={2}>
                            <NumberField
                                label={`数量`}
                                value={row.qty}
                                onValueChange={(v: number | null) => onUpdate(index, { qty: v ?? 1 })}
                                min={1}
                                max={500}
                                error={!!errors?.qty}
                                helperText={errors?.qty}
                            />
                            <FormControl
                                fullWidth
                                error={!!errors?.price}
                            >
                                <InputLabel
                                    htmlFor={`outlined-adornment-price-${index}`}
                                    sx={{
                                        color: colors.grey[100],
                                        '&.Mui-focused': {
                                            color: colors.grey[200],
                                        },
                                    }}
                                >
                                    単価
                                </InputLabel>
                                <OutlinedInput
                                    id={`outlined-adornment-price-${index}`}
                                    endAdornment={<InputAdornment position="end">¥</InputAdornment>}
                                    label="単価"
                                    value={row.price}
                                    onChange={(e) =>
                                        onUpdate(index, { price: Number(e.target.value) || 0 })
                                    }
                                    sx={styledSelect}
                                />
                                {errors?.price && (
                                    <FormHelperText sx={{ color: 'error.main' }}>
                                        {errors.price}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Stack>

                        <TextField
                            fullWidth
                            label="合計"
                            value={total}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    endAdornment: <InputAdornment position="end">¥</InputAdornment>,
                                },
                            }}
                            sx={{
                                mt: 2,
                                ...descriptionTextField
                            }}
                        />
                        <TextField
                            label="備考"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            sx={{
                                mt: 3,
                                ...descriptionTextField,
                            }}
                            value={row.note}
                            onChange={(e) => onUpdate(index, { note: e.target.value })}
                        />
                    </Box>
                </Box>
            )}
            <Stack
                direction="row"
                position="absolute"
                bottom={2}
                right={4}
            >
                <Tooltip title="削除">
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => onDelete(index)} disabled={totalRows === 1}
                            aria-label="削除"
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                {isLast && (
                    <Tooltip title="追加">
                        <IconButton size="small" onClick={onAdd} aria-label="追加">
                            <AddCircleIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Box>
    )
}

export default SellRowItem;