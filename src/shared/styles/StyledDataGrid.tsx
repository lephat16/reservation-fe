import type { ColorTokens } from "../types/shared";

type StyledDataGridOptions = {
    headerBg?: string;
    rowHoverBg: string;
    cellPadding?: string;
};

export const styledDataGrid = (
    colors: ColorTokens,
    options?: StyledDataGridOptions
) => ({
    backgroundColor: colors.primary[400],
    border: "none",
    '& .MuiDataGrid-toolbar': {
        backgroundColor: options?.headerBg ?? colors.gridHeader[100],
        borderBottom: "none",
    },
    '& .MuiDataGrid-sortButton': {
        backgroundColor: options?.headerBg ?? `${colors.blueAccent[700]}!important`,
    },
    '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader:nth-of-type(2)': {
        borderTopLeftRadius: '10px',
    },
    '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader:nth-last-of-type(3)': {
        borderTopRightRadius: '10px',
    },
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: options?.headerBg ?? colors.blueAccent[700],
        color: colors.grey[100],
        fontWeight: 600,
    },
    '& .MuiDataGrid-columnHeader': {
        backgroundColor: options?.headerBg ?? colors.blueAccent[700],
    },
    '& .MuiDataGrid-cell': {
        color: colors.grey[100],
    },

    '& .MuiDataGrid-row:hover': {
        backgroundColor: options?.rowHoverBg,
    },

    '& .MuiDataGrid-footerContainer': {
        // borderTop: `1px solid ${colors.grey[700]}`,
    },

    '& .MuiTablePagination-toolbar': {
        minHeight: 40,
    },
    "& .MuiDataGrid-actionsCell": {
      gap: 0,
    },
});