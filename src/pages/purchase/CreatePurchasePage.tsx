import { Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, useTheme, type SelectChangeEvent } from '@mui/material';
import { tokens } from '../../theme';
import { useQuery } from '@tanstack/react-query';
import ApiService from '../../services/ApiService';
import type { SupplierData, SupplierProductData } from '../../types/supplier';
import Header from '../../layout/Header';
import CustomSnackbar from '../../components/customSnackbar/CustomSnackbar';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useState } from 'react';
import NumberField from '../../components/fields/NumberField';
import { number } from 'yup';

type PurchaseDetail = {
    productId: number;
    qty: number;
    cost: number;
    note: string;
};

type PurchaseItem = {
    supplierId: number;
    details: PurchaseDetail[];
    description: string;
};
const CreatePurchasePage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
    const [openSelectSupplier, setOpenSelectSupplier] = useState(false);

    const [products, setProducts] = useState<SupplierProductData[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProductData | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<SupplierProductData[]>([{
        id: selectedProduct?.id || 0,
        sku: selectedProduct?.sku || "",
        product: selectedProduct?.product || "",
        price: selectedProduct?.price || 0,
        stock: selectedProduct?.stock,
        leadTime: selectedProduct?.leadTime,
    }]);

    const [quantity, setQuantity] = useState<number | null>(null)
    const [note, setNote] = useState<string | null>(null)

    const [purchaseItem, setPurchaseItem] = useState<PurchaseItem | null>(null);
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);

    const [isAddingProduct, setIsAddingProduct] = useState(false);


    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();  // スナックバー管理用カスタムフック

    const { isLoading, error, data } = useQuery<SupplierData[]>({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const resSuppliers = await ApiService.getAllSuppliers();
            return resSuppliers.data;
        },
    });

    const fetchProducts = async (supplierId: number) => {
        const response = await ApiService.getSupplierProductsWithLeadTime(supplierId);
        console.log(response.data[0].products);
        setProducts(response.data[0].products);
    };

    const handleSupplierChange = (event: SelectChangeEvent<number>) => {
        const selectedSupplierId = event.target.value;
        const selectedSupplier = data?.find(supplier => supplier.id === Number(selectedSupplierId)) || null;
        setSelectedSupplier(selectedSupplier);
        setSelectedProduct(null);
        fetchProducts(selectedSupplierId);

    };
    const handleProductChange = (event: SelectChangeEvent<number>, index: number) => {
        const selectedProductId = event.target.value;
        const selectedProd = products.find(product => product.id === selectedProductId) || null;
        setSelectedProduct(selectedProd);
        // setSelectedProducts(prevProducts => [
        //     ...prevProducts,
        //     {
        //         id: selectedProduct?.id || 0,
        //         sku: selectedProduct?.sku || "",
        //         product: selectedProduct?.product || "",
        //         price: selectedProduct?.price || 0,
        //         stock: selectedProduct?.stock || 0,
        //         leadTime: selectedProduct?.leadTime || 0,
        //     }
        // ]);

    };
    const handleCloseSelectSupplier = () => {
        setOpenSelectSupplier(false);
    };

    const handleOpenSelectSupplier = () => {
        setOpenSelectSupplier(true);
    };

    const handleAddProduct = (index: number, newValue: PurchaseDetail) => {
        if (!selectedProduct) return;
        setPurchaseDetails(prevDetails => [
            ...prevDetails,
            newValue
        ]
        );
        setSelectedProducts(prevProducts => [
            ...prevProducts,
            {
                id: selectedProduct?.id || 0,
                sku: selectedProduct?.sku || "",
                product: selectedProduct?.product || "",
                price: selectedProduct?.price || 0,
                stock: selectedProduct?.stock || 0,
                leadTime: selectedProduct?.leadTime || 0,
            }
        ]);
        setSelectedProduct(null);
    };
    return (
        <Box m={3}>
            <Header
                title="新規注文作成"
                subtitle="新しい注文の詳細を入力してください"
            />
            <Box mt={3} height="75vh">
                {/* メッセージ表示 */}
                <CustomSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={closeSnackbar}
                />
                {/* ローディング表示 */}
                {(isLoading) && (
                    <Box textAlign="center" my={4}>
                        <CircularProgress />
                        <Typography>データを読み込み中...</Typography>
                    </Box>
                )}
                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}

                <Box >
                    <Button
                        sx={{ display: 'block', mt: 2, ml: 1 }}
                        color="secondary"
                        onClick={handleOpenSelectSupplier}
                    >
                        仕入先を選択
                    </Button>
                    <FormControl sx={{ m: 1, minWidth: 340 }}>
                        <InputLabel
                            id="controlled-open-select-suppliers-label"
                            sx={{
                                color: colors.grey[100],
                                '&.Mui-focused': {
                                    color: colors.grey[200],
                                },
                            }}
                        >
                            仕入先</InputLabel>
                        <Select
                            labelId="controlled-open-select-suppliers-label"
                            id="controlled-open-select-suppliers"
                            open={openSelectSupplier}
                            onClose={handleCloseSelectSupplier}
                            onOpen={handleOpenSelectSupplier}
                            value={selectedSupplier?.id || ''}
                            label="仕入先"
                            onChange={handleSupplierChange}
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.grey[600],
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.grey[400],
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.grey[200],
                                },


                            }}
                        >

                            {data?.map((supplier) => (
                                <MenuItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}

                        </Select>
                    </FormControl>
                </Box>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {selectedSupplier && (
                        selectedProducts?.map((p, i) => (
                            <Box key={i}>

                                <Stack m={1} direction={'row'} gap={3}>

                                    <Typography variant="h6">{selectedSupplier.name}</Typography>
                                    <Typography variant="h6">[{selectedSupplier.address}]</Typography>
                                    <Button
                                        variant="contained"
                                        color='secondary'
                                        sx={{ m: 1 }}
                                        onClick={() => handleAddProduct(i, {
                                            productId: p.id,
                                            qty: quantity || 0,
                                            cost: p.price,
                                            note: note || ""
                                        })}
                                    >
                                        商品を追加
                                    </Button>
                                </Stack>

                                {products?.length === 0 ? (
                                    <CircularProgress />
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

                                            value={selectedProducts[i]?.id || ''}
                                            label="商品名"
                                            onChange={(event) => handleProductChange(event, i)}
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: colors.grey[600],
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: colors.grey[400],
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: colors.grey[200],
                                                },


                                            }}
                                        >

                                            {products?.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.product}
                                                </MenuItem>
                                            ))}

                                        </Select>
                                    </FormControl>
                                )}
                                {selectedProduct && (
                                    <Box
                                        border={1}
                                        borderRadius={1}
                                        m={1}
                                        p={2}
                                        key={p.id}
                                        width="340px"
                                        sx={{
                                            borderColor: colors.grey[400]

                                        }}
                                    >
                                        <Typography variant="h6" textAlign="center" mb={2}>{selectedProduct.product}</Typography>

                                        <Box mb={2}>
                                            <Typography>商品ID: <strong>{selectedProduct.id}</strong></Typography>
                                            <Typography mb={2}>価格: <strong>{selectedProduct.price}</strong></Typography>
                                            <Stack direction="row" gap={2}>

                                                <NumberField
                                                    label="数量"
                                                    onValueChange={(newValue) =>
                                                        setQuantity(newValue)
                                                    }
                                                    min={1}
                                                    max={500}
                                                />

                                                <TextField
                                                    label="合計"
                                                    defaultValue="0¥"
                                                    value={(quantity != null ? quantity * selectedProduct.price : 0).toString() + " ¥"}
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        },
                                                    }}
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            color: colors.grey[100],
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: colors.grey[200],
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: colors.grey[600],
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: colors.grey[400],
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: colors.grey[200],
                                                            },
                                                        },
                                                        '& .MuiOutlinedInput-input': {
                                                            color: colors.grey[100],
                                                        },
                                                    }}
                                                />
                                            </Stack>
                                            <Typography mt={2}>リードタイム: <strong>{selectedProduct.leadTime}日</strong></Typography>
                                        </Box>

                                        <TextField
                                            label="ノート"
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            sx={{
                                                marginBottom: 2,
                                                '& .MuiInputLabel-root': {
                                                    color: colors.grey[100],
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: colors.grey[200],
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: colors.grey[600],
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: colors.grey[400],
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: colors.grey[200],
                                                    },
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: colors.grey[100],
                                                },
                                            }}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />

                                        <Box textAlign="center">
                                            <Button variant="contained" color="primary">保存</Button>
                                        </Box>
                                    </Box>
                                )

                                }
                            </Box>
                        ))
                    )}
                </Grid>



            </Box>
        </Box>
    )
}

export default CreatePurchasePage