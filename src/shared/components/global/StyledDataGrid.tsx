import { useTheme } from "@mui/material";
import { DataGrid, type DataGridProps, type GridValidRowModel } from "@mui/x-data-grid";
import { tokens } from "../../theme";

interface StyledDataGridProps<T extends GridValidRowModel> extends DataGridProps<T> {
    bgColor?: string;
    footerColor?: string;
    toolbarColor?: string;
    headerColor?: string;
}

export function StyledDataGrid<T extends GridValidRowModel>(props: StyledDataGridProps<T>) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const {
        bgColor = colors.primary[400],
        footerColor = colors.greenAccent[700],
        toolbarColor = colors.greenAccent[700],
        headerColor = colors.greenAccent[800],
        ...rest
    } = props;

    return (
        <DataGrid
            {...rest}
            sx={{
                "--DataGrid-t-color-interactive-focus": "none !important",
                "& .MuiDataGrid-root": { border: "none" },
                "& .MuiDataGrid-cell": { borderBottom: "none" },
                "& .name-column--cell": { color: colors.greenAccent[300] },
                "& .MuiDataGrid-columnHeaders": { color: colors.grey[100], borderBottom: "none" },
                "& .MuiDataGrid-virtualScroller": { backgroundColor: bgColor },
                "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: footerColor },
                "& .MuiCheckbox-root": { color: `${colors.greenAccent[400]} !important` },
                "& .MuiDataGrid-toolbar": { backgroundColor: toolbarColor },
                "& .MuiDataGrid-columnHeader": { backgroundColor: headerColor },
                ...props.sx,
            }}
        />
    );
}
