import {
    Box,
    Chip,
    IconButton,
    Skeleton,
    Tooltip,
    useTheme
} from "@mui/material";
import Header from "../../shared/components/layout/Header";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupplierData } from "./types/supplier";
import {
    GridActionsCell,
    GridActionsCellItem,
    type GridColDef,
    type GridRenderCellParams,
    type GridRowId
} from '@mui/x-data-grid-pro';
import { createContext, useContext, useMemo, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { DataGrid, type GridValueGetter } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { useNavigate } from "react-router-dom";
import SupplierForm from "./components/SupplierForm";
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { supplierAPI } from "./api/supplierAPI";
import { useAllSuppliers } from "./hooks/useAllSuppliers";
import { styledDataGrid } from "../../shared/styles/StyledDataGrid";
import { getErrorMessage } from "../../shared/utils/errorHandler";
import { useSnackbar } from "../../shared/hooks/SnackbarContext";
import { useDialogs } from "../../shared/hooks/dialogs/useDialogs";
import { STATUS } from "../../constants/status";
import { useScreen } from "../../shared/hooks/ScreenContext";
import { tokens } from "../../shared/theme";
import { blue, red } from "@mui/material/colors";

/** 
 * 仕入先一覧ページコンポーネント
 * 
 * 仕入先の情報を一覧表示し、新規追加、削除、詳細表示を行うページ。購入先の情報を表形式で表示し、削除や詳細表示の操作を提供します。
 * 操作の際は確認ダイアログが表示され、追加や削除の処理後には画面上にスナックバーでメッセージが表示されます。
 */

interface ActionHandlers {
    deleteSupplier: (id: GridRowId) => void;
    seeMoreSupplier: (id: GridRowId) => void;
}

const ActionHandlersContext = createContext<ActionHandlers>({
    deleteSupplier: () => { },
    seeMoreSupplier: () => { },
});
function ActionsCell(props: GridRenderCellParams) {
    const theme = useTheme();
    const { deleteSupplier, seeMoreSupplier } =
        useContext(ActionHandlersContext);

    return (
        <GridActionsCell {...props}>
            <GridActionsCellItem
                icon={<DeleteIcon
                    sx={{
                        '&:hover': {
                            color: theme.alpha(red[700], 1),
                        },
                    }}
                />}
                label="削除"
                onClick={() => deleteSupplier(props.id)}
                size="small"

            />
            <GridActionsCellItem
                icon={<InfoIcon
                    sx={{
                        '&:hover': {
                            color: theme.alpha(blue[700], 1),
                        },
                    }}
                />}
                label="詳細"
                onClick={() => seeMoreSupplier(props.id)}
                size="small"
            />
        </GridActionsCell>
    );
}

const columns: GridColDef<SupplierData>[] = [
    {
        field: "id",
        headerName: "ID",
        flex: 0.5
    },
    {
        field: "name",
        headerName: "仕入先名",
        flex: 1
    },
    {
        field: "contactInfo",
        headerName: "電話番号",
        flex: 1,
    },
    {
        field: "address",
        headerName: "住所",
        flex: 1,
    },
    {
        field: "categoryNames",
        headerName: "カテゴリ数",
        flex: 0.8,
        valueGetter: ((_, row) => {
            const categories = row.categoryNames;
            if (!categories) return 0;
            return categories.length + '件';
        }) as GridValueGetter<SupplierData, number>,

    },
    {
        field: "supplierStatus",
        headerName: "ステータス",
        flex: 0.8,
        renderCell: (params) => {
            const value = params.value as string;

            return (
                <Chip
                    label={value}
                    color={value === STATUS.ACTIVE.value ? "success" : "default"}
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
    const { isSM } = useScreen();

    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const { confirmDelete } = useDialogs();

    const [openAddSupplierForm, setOpenAddSupplierForm] = useState(false);

    const { isLoading, error, data } = useAllSuppliers();

    const addMutation = useMutation({
        mutationFn: async (data: SupplierData) => supplierAPI.addSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            showSnackbar(SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");

        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => supplierAPI.deleteSupplier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            showSnackbar(SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.DELETE_FAILED, "error");
        }
    });

    const seeMoreSupplier = (id: GridRowId) => {
        navigate(`/suppliers/${id}`);
    }

    const deleteSupplier = async (id: GridRowId) => {
        const supplier = data?.find(c => c.id === id);
        if (!supplier) return;
        const ok = await confirmDelete(
            `仕入先「${supplier.name}」を削除しますか`
        );
        if (ok) {
            deleteMutation.mutate(Number(id));
        }
    }
    const actionHandlers = useMemo<ActionHandlers>(
        () => ({
            deleteSupplier,
            seeMoreSupplier
        }),
        [deleteSupplier, seeMoreSupplier],
    );

    const displayColumns = isSM ? columns
        .filter((c: GridColDef) => ["id", "name", "supplierStatus", "address", "action"]
            .includes(c.field)) :
        columns;
    return (
        <Box mx={3} mb={3}>
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
                {/* エラー表示 */}
                {(error) && (
                    <ErrorState />
                )}

                <ActionHandlersContext.Provider value={actionHandlers}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={400} />
                    ) : (
                        <DataGrid<SupplierData>
                            rows={data ?? []}
                            columns={displayColumns}
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
                            sx={{
                                ...styledDataGrid(colors, {
                                    rowHoverBg:
                                        theme.palette.mode === "dark"
                                            ? colors.primary[500]
                                            : colors.grey[900],
                                }),
                            }} />
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
            </Box>
        </Box>
    )
}

export default AllSupplierPage;