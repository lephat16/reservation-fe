import { DataGrid, type DataGridProps, type GridValidRowModel } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

interface CustomDataGridStyledProps {
  mode: 'light' | 'dark';
}

const CustomDataGrid = styled(DataGrid)<CustomDataGridStyledProps>(({ mode }) => ({
  backgroundColor: mode === 'light' ? '#f8fafc' : '#334155',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: mode === 'light' ? '#eaeff5' : '#1e293b',
    color: mode === 'light' ? '#000' : '#fff',
  },
  '& .MuiDataGrid-cell': {
    color: mode === 'light' ? '#000' : '#fff',
  },
}));
export interface MyDataGridProps<T extends GridValidRowModel> extends DataGridProps<T> {
  mode: 'light' | 'dark';
}

export function MyDataGrid<T extends GridValidRowModel>(props: MyDataGridProps<T>) {
  const { mode, ...rest } = props;

  // @ts-ignore: bypass TS generic incompatibility in styled
  return <CustomDataGrid {...rest} mode={mode} />;
}
