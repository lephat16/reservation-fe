import { DataGrid, GridActionsCell, GridActionsCellItem, type GridColDef, type GridRenderCellParams, type GridRowId } from "@mui/x-data-grid";
import type { CategorySummariesData } from "../../types";
import { Box, Chip, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../layout/Header";
import { useQuery } from "@tanstack/react-query";
import ApiService from "../../services/ApiService";
import { jaJP } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    const { isLoading, error, data } = useQuery<CategorySummariesData[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const resCategories = await ApiService.getAllCategorySummaries();
            console.log(resCategories);
            console.log(resCategories.data);
            return resCategories.data;
        }
    });


    const seeMoreCategory = (id: GridRowId) => {
         navigate(`/category/${id}`);
    }
    const deleteCategory = () => {

    }

    const actionHandlers = useMemo<ActionHandlers>(
        () => ({
            deleteCategory,
            seeMoreCategory
        }),
        [deleteCategory, seeMoreCategory],
    );
    return (
        <Box m="20px">
            <Header
                title="カテゴリ一覧"
                subtitle="カテゴリ情報の一覧表示"
            />
            <Box m="40px 0 0 0" height="75vh">

                {/* エラー表示 */}
                {(error) && (
                    <p className="error">データの取得に失敗しました。</p>
                )}
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

            </Box>
        </Box>
    )
}

export default CategoriesPage;