import { Box, Chip, IconButton, Skeleton, Tooltip, useTheme } from "@mui/material";
import Header from "../../pages/Header";
import { tokens } from "../../shared/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupplierData } from "./types/supplier";
import { GridActionsCell, GridActionsCellItem, type GridColDef, type GridRenderCellParams, type GridRowId } from '@mui/x-data-grid-pro';
import { createContext, useContext, useMemo, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { type GridValueGetter } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "../products/components/ProductPage";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import SupplierForm from "./components/SupplierForm";
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import type { AxiosError } from "axios";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { supplierAPI } from "./api/supplierAPI";
import { useAllSuppliers } from "./hooks/useAllSuppliers";
import { StyledDataGrid } from "../../shared/components/global/StyledDataGrid";


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
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);

    const [openAddSupplierForm, setOpenAddSupplierForm] = useState(false);

    const { isLoading, error, data } = useAllSuppliers();

    const addMutation = useMutation({
        mutationFn: async (data: SupplierData) => supplierAPI.addSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            showSnackbar(SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => supplierAPI.deleteSupplier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            setOpenDeleteConfirm(false);
            setSelectedSupplier(null);
            showSnackbar(SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
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
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header
                        title={`仕入先一覧`}
                        subtitle={`全ての仕入先情報を表示`}
                    />
                )}
                <Box mt={4}>
                    <Tooltip title="追加">
                        <IconButton aria-label="追加" color="success" onClick={() => {
                            setOpenAddSupplierForm(true)
                        }}>
                            <AddHomeWorkIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box mt={3} height="75vh">
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

                <ActionHandlersContext.Provider value={actionHandlers}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={400} />
                    ) : (
                        <StyledDataGrid<SupplierData>
                            rows={data ?? []}
                            columns={columns}
                            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                            loading={isLoading}
                            showToolbar
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[10]}
                            footerColor={colors.blueAccent[700]}
                            toolbarColor={colors.blueAccent[700]}
                            headerColor={colors.blueAccent[500]}
                        />
                    )}
                </ActionHandlersContext.Provider>

                {openAddSupplierForm && (
                    <SupplierForm
                        open
                        onClose={() => setOpenAddSupplierForm(false)}
                        onSubmit={(data: SupplierData) => {
                            addMutation.mutate(data);
                        }}
                    />
                )}
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