import { DataGrid, type DataGridProps, type GridValidRowModel } from "@mui/x-data-grid";

interface StyledDataGridProps<T extends GridValidRowModel> extends DataGridProps<T> {
    mode: 'light' | 'dark';
}

export function StyledDataGrid<T extends GridValidRowModel>(props: StyledDataGridProps<T>) {
    

    const {
        mode,
        ...rest
    } = props;

    return (
        <DataGrid
            {...rest}
            sx={{
                backgroundColor: mode === 'light' ? '#f8fafc' : '#334155',
                '& .MuiDataGrid-columnHeader': {
                    backgroundColor: mode === 'light' ? '#eaeff5' : '#1e293b',
                    color: mode === 'light' ? '#000' : '#fff',
                },
                '& .MuiDataGrid-cell': {
                    color: mode === 'light' ? '#000' : '#fff',
                },
                '& .MuiDataGrid-pinnedRow': {
                    backgroundColor: mode === 'light' ? '#f1f5f9' : '#293548',
                },
                '& .MuiDataGrid-row:hover': {
                    backgroundColor: mode === 'light' ? '#e0e7ff' : '#1f2937',
                },
                '& .MuiDataGrid-row.Mui-selected': {
                    backgroundColor: mode === 'light' ? '#c7d2fe' : '#334155',
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#baccff' : '#2c3a4a',
                    },
                },
                ...props.sx,
            }}
        />
    );
}
