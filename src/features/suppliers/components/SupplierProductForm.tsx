
import { Box, Button, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, MenuItem, Paper, Radio, RadioGroup, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import { styledTable } from '../../../shared/components/global/StyleTable'
import type { SupplierProductFormType, SupplierProducWithPriceHistory } from '../types/supplier'
import { tokens } from '../../../shared/theme'
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { StyledSelectTextField } from '../../../shared/components/global/StyledSelectTextField'
import CommentIcon from '@mui/icons-material/Comment';
import type { ProductData } from '../../products/types/product'


type SupplierProductFormProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SupplierProductFormType) => void;
    supplierProduct?: SupplierProducWithPriceHistory;
    products?: ProductData[]
}

const SupplierProductForm = ({
    open,
    onClose,
    onSubmit,
    supplierProduct,
    products
}: SupplierProductFormProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [isEdit, setIsEdit] = useState(false);
    const [openNoteForm, setOpenNoteForm] = useState(false)

    const schema = useMemo(() => yup.object({
        supplierSku: yup
            .string()
            .required("SKUは必須です")
            .matches(/^[A-Z0-9\-]+$/, "SKUは英大文字、数字、ハイフンのみ使用可能です")
            .min(3, "SKUは最低3文字必要です")
            .max(20, "SKUは最大20文字までです"),
        currentPrice: yup
            .number()
            .required("価格は必須です")
            .min(1, "価格は1以上である必要があります"),
        leadTime: yup
            .number()
            .required("リードタイムは必須です")
            .integer("リードタイムは整数である必要があります")
            .min(1, "リードタイムは1以上である必要があります"),
        status: yup
            .string()
            .oneOf(["ACTIVE", "INACTIVE"], "'ACTIVE' または 'INACTIVE' のいずれかを選択してください。")
            .required("ステータスは必須です。"),
        note: yup
            .string()
            .nullable()
            .max(50, 'ノートパソコンートは50文字以内で入力してください'),
        productId: !supplierProduct
            ? yup.number().typeError("商品IDは必須です")
                .required("商品IDは必須です")
            : yup.number().nullable(),
    }), []);

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SupplierProductFormType>({
        resolver: yupResolver(schema) as Resolver<SupplierProductFormType>,
        defaultValues: {
            supplierSku: "",
            currentPrice: 0,
            leadTime: 0,
            status: "INACTIVE",
            note: "",
        }
    });

    useEffect(() => {
        if (supplierProduct) {
            reset(supplierProduct)
        }
    }, [supplierProduct, reset]);


    const handleFormSubmit = (data: SupplierProductFormType) => {
        console.log(!data.productId)
        onSubmit(data);
        console.log(data)
        setIsEdit(false);
        setOpenNoteForm(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={(_e, reason) => {
                if (reason === 'backdropClick') {
                    return;
                }
                onClose();
            }}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: colors.blueAccent[900],
                        borderRadius: 2,
                        p: 2,
                        maxHeight: "80vh"
                    }
                }
            }}
        >
            <DialogTitle align="center" variant="h4" fontWeight={600}>
                {supplierProduct ? (isEdit ? "商品の編集" : "商品の情報") : "商品の追加"}
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    component="form"
                    onSubmit={handleSubmit(handleFormSubmit)} mt={2}
                >
                    <Stack display="flex" flexDirection="row" gap={1} mb={1}>
                        {supplierProduct ? (<TextField
                            label="商品名"
                            value={supplierProduct?.productName ?? ""}
                            variant="filled"
                            fullWidth
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                                htmlInput: {
                                    style: {
                                        cursor: "pointer",
                                    }
                                }

                            }}
                            sx={{
                                flex: 2,
                            }}
                        />
                        ) : (
                            <Controller
                                name="productId"
                                control={control}
                                render={({ field }) => (
                                    <StyledSelectTextField
                                        label="商品"
                                        select
                                        fullWidth
                                        variant="filled"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val ? Number(val) : undefined);
                                        }}
                                        error={!!errors.productId}
                                        helperText={errors.productId ? errors.productId.message : ''}
                                        bgColor={colors.blueAccent[900]}
                                        sx={{ flex: 1 }}
                                    >
                                        {products && products.length > 0 ? (
                                            products.map(p => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.productName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                商品を選択してください
                                            </MenuItem>
                                        )}

                                    </StyledSelectTextField>
                                )}
                            />
                        )}

                        <Controller
                            name="leadTime"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="リードタイム"
                                    variant="filled"
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: supplierProduct && !isEdit,
                                            endAdornment:
                                                <InputAdornment position="start">
                                                    日
                                                </InputAdornment>
                                        },
                                        htmlInput: {
                                            style: {
                                                cursor: supplierProduct && !isEdit ? "pointer" : "text",
                                            },


                                        }
                                    }}
                                    error={!!errors.leadTime}
                                    helperText={errors.leadTime ? errors.leadTime.message : ''}
                                    sx={{ flex: 1 }}
                                />
                            )}
                        />

                    </Stack>
                    <Stack display="flex" flexDirection="row" gap={1} mb={1}>
                        <Stack display="flex" flexDirection="row" gap={1} mb={1} sx={{ flex: 2 }}>
                            <Controller
                                name="supplierSku"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="SKU"
                                        variant="filled"
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                readOnly: supplierProduct && !isEdit,
                                            },
                                            htmlInput: {
                                                style: {
                                                    cursor: supplierProduct && !isEdit ? "pointer" : "text",
                                                }
                                            }
                                        }}
                                        error={!!errors.supplierSku}
                                        helperText={errors.supplierSku ? errors.supplierSku.message : ''}
                                    />
                                )}
                            />

                            <Controller
                                name="currentPrice"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="現在価格"
                                        variant="filled"
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                readOnly: supplierProduct && !isEdit,
                                                endAdornment:
                                                    <InputAdornment position="end" sx={{ cursor: "pointer" }}>
                                                        <Tooltip title="備考">
                                                            <span>
                                                                <IconButton
                                                                    onClick={() => setOpenNoteForm(!openNoteForm)}
                                                                    edge="end"
                                                                    disabled={!isEdit}
                                                                >
                                                                    <CommentIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </InputAdornment>,
                                                startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                            },
                                            htmlInput: {
                                                style: {
                                                    cursor: supplierProduct && !isEdit ? "pointer" : "text",
                                                }
                                            }
                                        }}
                                        error={!!errors.currentPrice}
                                        helperText={errors.currentPrice ? errors.currentPrice.message : ''}
                                    />
                                )}
                            />
                        </Stack>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <StyledSelectTextField
                                    label="ステータス"
                                    select
                                    fullWidth
                                    readOnly={supplierProduct && !isEdit}
                                    variant="filled"
                                    {...field}
                                    error={!!errors.status}
                                    helperText={errors.status ? errors.status.message : ''}
                                    bgColor={colors.blueAccent[900]}
                                    sx={{ flex: 1 }}
                                >
                                    <MenuItem value={"ACTIVE"}>ACTIVE</MenuItem>
                                    <MenuItem value={"INACTIVE"}>INACTIVE</MenuItem>
                                </StyledSelectTextField>
                            )}
                        />
                    </Stack>
                    {openNoteForm && <Controller
                        name="note"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="備考"
                                multiline
                                maxRows={2}
                                variant="filled"
                                fullWidth
                                error={!!errors.note}
                                helperText={errors.note ? errors.note.message : ''}
                            />
                        )}
                    />}
                </Box>
                <Divider>
                    <Typography variant="h6" textAlign="center">
                        価格履歴
                    </Typography>
                </Divider>
                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: 300,
                        mt: 1
                    }}
                >
                    <Table
                        size="small"
                        stickyHeader
                        sx={{
                            ...styledTable(theme.palette.mode)
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>日付</TableCell>
                                <TableCell>価格</TableCell>
                                <TableCell>備考</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(supplierProduct?.priceHistories ?? []).map((ph) => (
                                <TableRow key={ph.id}>
                                    <TableCell>{ph.effectiveDate}</TableCell>
                                    <TableCell>{ph.price.toLocaleString()}</TableCell>
                                    <TableCell>{ph.note || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                {supplierProduct ? (
                    isEdit ? (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                disabled={isSubmitting}
                                // onClick={() => handleSubmit(handleFormSubmit, (errors) => {
                                //     console.log("validation errors:", errors);
                                // })()}
                                onClick={() => handleSubmit(handleFormSubmit, (data) => {
                                    console.log("data", data);
                                })()}
                            >
                                {isSubmitting ? "送信中..." : "確認"}
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={() => {
                                    reset(supplierProduct);
                                    setIsEdit(false);
                                    setOpenNoteForm(false);
                                }}
                            >
                                キャンセル
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={() => setIsEdit(true)}
                            >
                                編集
                            </Button>
                            <Button variant="contained" onClick={() => {
                                setIsEdit(false);
                                setOpenNoteForm(false);
                                onClose();
                            }}>
                                閉じる
                            </Button>
                        </>
                    )
                ) : (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit(handleFormSubmit)}
                        >
                            追加
                        </Button>
                        <Button variant="contained" onClick={() => {
                            setIsEdit(false);
                            setOpenNoteForm(false);
                            onClose();
                        }}>
                            閉じる
                        </Button>
                    </>
                )}

            </DialogActions>
        </Dialog>
    )
}

export default SupplierProductForm;