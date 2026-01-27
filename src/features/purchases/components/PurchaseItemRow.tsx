import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import NumberField from "../../../shared/components/fields/NumberField";
import type { SupplierData, SupplierProductData } from "../../suppliers/types/supplier";
import { tokens } from "../../../shared/theme";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { descriptionTextField } from "../../../shared/styles/descriptionTextField";
import { styledSelect } from "../../../shared/styles/styledSelect";

type PurchaseRow = {
    product: SupplierProductData | null;
    qty: number;
    note: string;
};

type Props = {
    index: number;
    row: PurchaseRow;
    rows: PurchaseRow[];

    selectedSupplier: SupplierData;
    productData?: SupplierProductData[];
    isLoadingProducts: boolean;
    productError: unknown;

    onProductChange: (index: number, productId: number) => void;
    onQtyChange: (index: number, qty: number) => void;
    onNoteChange: (index: number, note: string) => void;
    onAddRow: () => void;
    onDeleteRow: (index: number) => void;
};


export const PurchaseItemRow = ({
    index: i,
    row,
    rows,
    selectedSupplier,
    productData,
    isLoadingProducts,
    productError,
    onProductChange,
    onQtyChange,
    onNoteChange,
    onAddRow,
    onDeleteRow,
}: Props) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box>
            <Stack m={1} direction={'row'} gap={3}>
                <Typography variant="h6">{selectedSupplier.name}</Typography>
                <Typography variant="h6">[{selectedSupplier.address}]</Typography>
            </Stack>

            {/* 商品選択 */}
            {isLoadingProducts ? (
                <Skeleton variant="rectangular" height={200} />
            ) : productError ? (
                <Typography color="error">商品データの取得に失敗しました</Typography>
            ) : productData?.length === 0 ? (
                <Typography color="warning" ml={1}>選択可能な商品はありません</Typography>
            ) : (
                <FormControl sx={{ m: 1, minWidth: 340 }}>
                    <InputLabel
                        id={`controlled-open-select-products-label-${i}`}
                        sx={{
                            color: colors.grey[100],
                            '&.Mui-focused': {
                                color: colors.grey[200],
                            },
                        }}
                    >
                        商品名</InputLabel>
                    <Select
                        labelId={`controlled-open-select-products-label-${i}`}
                        id={`controlled-open-select-products-${i}`}

                        value={row.product?.id || ''}
                        label="商品名"
                        onChange={(event) =>
                            onProductChange(i, Number(event.target.value))
                        }
                        sx={styledSelect}
                    >
                        {productData?.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.product}
                            </MenuItem>
                        ))}

                    </Select>
                </FormControl>
            )}

            {/* 選択された商品の詳細 */}
            {row.product && (
                <Box
                    border={1}
                    borderRadius={1}
                    m={1}
                    p={2}
                    key={row.product?.id}
                    width="340px"
                    sx={{
                        borderColor: colors.grey[400],
                        position: "relative"
                    }}
                >
                    {/* 削除ボタン */}

                    <Stack
                        direction="row"
                        sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 8,
                        }}
                    >
                        {rows.length > 1 && (
                            <Tooltip title="削除">
                                <IconButton
                                    size="small"
                                    onClick={() => onDeleteRow(i)}

                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="追加">
                            <IconButton
                                size="small"
                                onClick={onAddRow}

                            >
                                <AddCircleIcon />
                            </IconButton>
                        </Tooltip>

                    </Stack>


                    <Typography variant="h6" textAlign="center" mb={2}>{row.product.product}</Typography>

                    <Box mb={2}>
                        <Typography>商品ID: <strong>{row.product.id}</strong></Typography>
                        <Typography mb={2}>単価: <strong>{row.product.price}</strong></Typography>

                        {/* 数量と小計 */}
                        <Stack direction="row" gap={2}>
                            <NumberField
                                label="数量"
                                value={row.qty}
                                onValueChange={(v) =>
                                    onQtyChange(i, v ?? 1)
                                }
                                min={1}
                                max={500}
                            />

                            <TextField
                                label="合計"
                                value={`${row.qty * row.product.price} ¥`}

                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                                sx={descriptionTextField}
                            />
                        </Stack>
                        <Typography mt={2}>リードタイム: <strong>{row.product.leadTime}日</strong></Typography>
                    </Box>

                    {/* メモ入力 */}
                    <TextField
                        label="ノート"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{
                            marginBottom: 2,
                            ...descriptionTextField,
                        }}
                        value={row.note}
                        onChange={(e) =>
                            onNoteChange(i, e.target.value)
                        }
                    />
                </Box>
            )}
        </Box>
    );
};
