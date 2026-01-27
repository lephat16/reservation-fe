import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface CustomPaginationProps {
  count: number;
  page: number; 
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void; 
}

const CustomPagination: React.FC<CustomPaginationProps> = ({ count, page, onChange }) => {
  return (
    <Stack spacing={2} alignItems="center">
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
            {...item}
          />
        )}
      />
    </Stack>
  );
};

export default CustomPagination;
