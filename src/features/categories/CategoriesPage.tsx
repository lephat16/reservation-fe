import {  GridActionsCell, GridActionsCellItem, type GridColDef, type GridRenderCellParams, type GridRowId } from "@mui/x-data-grid";
import type { CategorySummariesData } from "./types/category";
import { Box, Chip, IconButton, Skeleton, Tooltip, useTheme } from "@mui/material";
import { tokens } from "../../shared/theme";
import Header from "../../pages/Header";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jaJP } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../shared/hooks/useSnackbar";
import CustomSnackbar from "../../shared/components/global/CustomSnackbar";
import NewLabelIcon from '@mui/icons-material/NewLabel';
import type { AxiosError } from "axios";
import ErrorState from "../../shared/components/messages/ErrorState";
import { SNACKBAR_MESSAGES } from "../../constants/message";
import { DeleteConfirmDialog } from "../products/components/ProductPage";
import { categoryAPI } from "./api/categoryAPI";
import { useCategorySummaries } from "./hooks/useCategorySummaries";
import { StyledDataGrid } from "../../shared/components/global/StyledDataGrid";
import CategoryForm from "./components/CategoryForm";

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
    const [openAddCategoryForm, setOpenAddCategoryForm] = useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState<CategorySummariesData | null>(null);

    const { isLoading, error, data } = useCategorySummaries();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => categoryAPI.deleteCategory(id),
        onSuccess: () => {
            setOpenDeleteConfirm(false);
            setSelectedCategory(null);
            showSnackbar(SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");
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
                        <IconButton
                            color="success"
                            aria-label="追加"
                            onClick={() => {
                                setOpenAddCategoryForm(true)
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
                    <ErrorState />
                )}
                {isLoading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <ActionHandlersContext.Provider value={actionHandlers}>

                        <StyledDataGrid<CategorySummariesData>
                            rows={data ?? []}
                            columns={columns}
                            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                            loading={isLoading}
                            showToolbar
                            bgColor={colors.primary[400]}
                            footerColor={colors.blueAccent[700]}
                            toolbarColor={colors.blueAccent[700]}
                            headerColor={colors.blueAccent[500]}
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
                {openAddCategoryForm && (
                    <CategoryForm
                        open
                        onClose={() => setOpenAddCategoryForm(false)}
                        onSubmit={() => {

                        }}
                    />
                )}
            </Box>
        </Box>
    )
}

export default CategoriesPage;