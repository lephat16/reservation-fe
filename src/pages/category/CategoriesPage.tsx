import { DataGrid, GridActionsCell, GridActionsCellItem, type GridColDef, type GridRenderCellParams, type GridRowId } from "@mui/x-data-grid";
import type { CategorySummariesData } from "../../types";
import { Box, Chip, IconButton, Skeleton, Tooltip, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../layout/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApiService from "../../services/ApiService";
import { jaJP } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "../product/ProductPage";
import { useSnackbar } from "../../hooks/useSnackbar";
import CustomSnackbar from "../../components/customSnackbar/CustomSnackbar";
import NewLabelIcon from '@mui/icons-material/NewLabel';
import type { AxiosError } from "axios";

interface ActionHandlers {
    deleteCategory: (id: GridRowId) => void;
    seeMoreCategory: (id: GridRowId) => void;
}

const ActionHandlersContext = createContext<ActionHandlers>({
    deleteCategory: () => { },
    seeMoreCategory: () => { },
});
function ActionsCell(props: GridRenderCellParams) {
    const { deleteCategory, seeMoreCategory } =
        useContext(ActionHandlersContext);

    return (
        <GridActionsCell {...props}>
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="削除"
                onClick={() => deleteCategory(props.id)}
            />
            <GridActionsCellItem
                icon={<InfoIcon />}
                label="詳細"
                onClick={() => seeMoreCategory(props.id)}
            />
        </GridActionsCell>
    );
}
const columns: GridColDef<CategorySummariesData>[] = [
    {
        field: "id",
        headerName: "ID",
        flex: 0.2
    },
    {
        field: "categoryName",
        headerName: "カテゴリ名",
        flex: 1
    },
    {
        field: "products",
        headerName: "商品",
        flex: 1,
    },
    {
        field: "suppliers",
        headerName: "仕入先",
        flex: 1,
    },
    {
        field: "status",
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
const CategoriesPage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const navigate = useNavigate();
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

    const queryClient = useQueryClient();

    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openAddCategories, setOpenAddCategories] = useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState<CategorySummariesData | null>(null);

    const { isLoading, error, data } = useQuery<CategorySummariesData[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const resCategories = await ApiService.getAllCategorySummaries();
            return resCategories.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => ApiService.deleteCategory(id),
        onSuccess: () => {
            setOpenDeleteConfirm(false);
            setSelectedCategory(null);
            showSnackbar("カテゴリーを削除しました", "success");
            queryClient.invalidateQueries({ queryKey: ["categories"] });

        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || "削除に失敗しました", "error");
        }
    });

    const seeMoreCategory = (id: GridRowId) => {
        navigate(`/category/${id}`);
    }
    const deleteCategory = (id: GridRowId) => {
        const category = data?.find(c => c.id === id);
        if (!category) return;
        setSelectedCategory(category);
        setOpenDeleteConfirm(true)
    }

    const actionHandlers = useMemo<ActionHandlers>(
        () => ({
            deleteCategory,
            seeMoreCategory
        }),
        [deleteCategory, seeMoreCategory],
    );
    return (
        <Box m={3}>
            <Box display="flex" justifyContent="space-between">
                {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Header
                        title="カテゴリ一覧"
                        subtitle="カテゴリ情報の一覧表示"
                    />
                )}
                <Box mt={4}>
                    <Tooltip title="追加">
                        <IconButton color="success" onClick={() => {
                            setOpenAddCategories(true)
                        }}>
                            <NewLabelIcon fontSize="large" />
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
                    <p className="error">データの取得に失敗しました。</p>
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <ActionHandlersContext.Provider value={actionHandlers}>

                        <DataGrid<CategorySummariesData>
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
                        />
                    </ActionHandlersContext.Provider>
                )}
                <DeleteConfirmDialog
                    open={openDeleteConfirm}
                    onClose={() => setOpenDeleteConfirm(false)}
                    targetName={selectedCategory?.categoryName}
                    onDelete={() =>
                        selectedCategory &&
                        deleteMutation.mutate(selectedCategory?.id || 0)}
                    isDeleting={deleteMutation.isPending}
                />
            </Box>
        </Box>
    )
}

export default CategoriesPage;