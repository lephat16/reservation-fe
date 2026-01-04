import { Box, Chip, CircularProgress, Typography, useTheme } from "@mui/material";
import Header from "../../layout/Header";
import { tokens } from "../../theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApiService from "../../services/ApiService";
import type { SupplierData } from "../../types/supplier";
import { GridActionsCell, GridActionsCellItem, type GridColDef, type GridRenderCellParams, type GridRowId } from '@mui/x-data-grid-pro';
import { createContext, useContext, useMemo, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { DataGrid, type GridValueGetter } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "../product/ProductPage";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";



interface ActionHandlers {
    deleteSupplier: (id: GridRowId) => void;
    seeMoreSupplier: (id: GridRowId) => void;
}

const ActionHandlersContext = createContext<ActionHandlers>({
    deleteSupplier: () => { },
    seeMoreSupplier: () => { },
});
function ActionsCell(props: GridRenderCellParams) {
    const { deleteSupplier, seeMoreSupplier } =
        useContext(ActionHandlersContext);

    return (
        <GridActionsCell {...props}>
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="削除"
                onClick={() => deleteSupplier(props.id)}
            />
            <GridActionsCellItem
                icon={<InfoIcon />}
                label="詳細"
                onClick={() => seeMoreSupplier(props.id)}
            />
        </GridActionsCell>
    );
}

const columns: GridColDef<SupplierData>[] = [
    {
        field: "id",
        headerName: "ID",
        flex: 0.2
    },
    {
        field: "name",
        headerName: "カテゴリ名",
        flex: 1
    },
    {
        field: "contactInfo",
        headerName: "商品",
        flex: 1,
    },
    {
        field: "address",
        headerName: "仕入先",
        flex: 1,
    },
    {
        field: "categoryNames",
        headerName: "カテゴリー数",
        flex: 1,
        valueGetter: ((_, row) => {
            const categories = row.categoryNames;
            if (!categories) return 0;
            return categories.length + '件';
        }) as GridValueGetter<SupplierData, number>,

    },
    {
        field: "supplierStatus",
        headerName: "ステータス",
        flex: 1,
        renderCell: (params) => {
            const value = params.value as string;

            return (
                <Chip
                    label={value}
                    color={value === "ACTIVE" ? "success" : "default"}
                    size="small"
                    variant="filled"
                />
            );
        },
    },
    {
        field: "action",
        headerName: "操作",
        type: 'actions',
        flex: 0.8,
        renderCell: (params) => <ActionsCell {...params} />,
    }
];

const AllSupplierPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const queryClient = useQueryClient();

    const navigate = useNavigate();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [selectedSupplier, setSelectedSupplier] =
        useState<SupplierData | null>(null);


    const { isLoading, error, data } = useQuery<SupplierData[]>({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const resSuppliers = await ApiService.getAllSuppliers();
            console.log(resSuppliers);
            console.log(resSuppliers.data);
            return resSuppliers.data;
        }
    })


    const deleteMutation = useMutation({
        mutationFn: async (id: number) => ApiService.deleteSupplier(id),
        onSuccess: () => {
            setOpenDeleteConfirm(false);
            setSelectedSupplier(null);
            showSnackbar("仕入先を削除しました", "success");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });

        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "削除に失敗しました", "error");
        }
    });

    const seeMoreSupplier = (id: GridRowId) => {
        navigate(`/suppliers/${id}`);
    }


    const deleteSupplier = (id: GridRowId) => {
        const supplier = data?.find(c => c.id === id);
        if (!supplier) return;
        setSelectedSupplier(supplier);
        setOpenDeleteConfirm(true)
    }
    const actionHandlers = useMemo<ActionHandlers>(
        () => ({
            deleteSupplier,
            seeMoreSupplier
        }),
        [deleteSupplier, seeMoreSupplier],
    );
    return (


        <Box m={3}>
            <Header
                title={`仕入先一覧`}
                subtitle={`全ての仕入先情報を表示`}
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

                <ActionHandlersContext.Provider value={actionHandlers}>

                    <DataGrid<SupplierData>
                        rows={data ?? []}
                        columns={columns}
                        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                        loading={isLoading}
                        sx={{
                            "--DataGrid-t-color-interactive-focus": "none !important",
                            "& .MuiDataGrid-root": {
                                border: "none",
                            },
                            "& .MuiDataGrid-cell": {
                                borderBottom: "none",
                            },
                            "& .name-column--cell": {
                                color: colors.greenAccent[300],
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                color: colors.grey[100],
                                borderBottom: "none",
                            },
                            "& .MuiDataGrid-virtualScroller": {
                                backgroundColor: colors.primary[400],
                            },
                            "& .MuiDataGrid-footerContainer": {
                                borderTop: "none",
                                backgroundColor: colors.blueAccent[700],
                            },
                            "& .MuiCheckbox-root": {
                                color: `${colors.greenAccent[400]} !important`,
                            },
                            "& .MuiDataGrid-toolbar": {
                                backgroundColor: colors.blueAccent[700],
                            },
                            "& .MuiDataGrid-columnHeader": {
                                backgroundColor: colors.blueAccent[500],
                            },
                        }}
                        showToolbar
                        pageSizeOptions={[10]}
                    />
                </ActionHandlersContext.Provider>

                <DeleteConfirmDialog
                    open={openDeleteConfirm}
                    onClose={() => setOpenDeleteConfirm(false)}
                    targetName={selectedSupplier?.name}
                    onDelete={() =>
                        selectedSupplier &&
                        deleteMutation.mutate(selectedSupplier?.id || 0)}
                    isDeleting={deleteMutation.isPending}
                />

            </Box>
        </Box>
    )
}

export default AllSupplierPage;