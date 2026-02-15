
import React from 'react'
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import { tokens } from '../../../shared/theme'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { SupplierData } from '../types/supplier';

type SupplierDetailCardProps = {
  supplier: SupplierData,
  openDeleteDialog: () => void,
  openEditDialog: () => void
}
const SupplierDetailCard: React.FC<SupplierDetailCardProps> = ({
  supplier,
  openDeleteDialog,
  openEditDialog,
}) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ m: 2 }}>
      <Typography
        component="div"
        variant="h5"
        sx={{ fontWeight: 'bold', mb: 1 }}
      >
        {supplier.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        住所:  {supplier.address}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        メール: {supplier.mail}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        携帯電話: {supplier.contactInfo}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} mt={1}>
        <Chip
          label={supplier.supplierStatus === "ACTIVE" ? "稼働中" : "停止中"}
          color={supplier.supplierStatus === "ACTIVE" ? "success" : "error"}
          size="small"
        />
        <Tooltip title="削除">
          <IconButton
            aria-label="delete"
            size="small"
            sx={{
              '&:hover': {
                color: "red",
              },
            }}
            onClick={openDeleteDialog}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="編集">
          <IconButton
            aria-label="edit"
            size="small"
            sx={{
              '&:hover': {
                color: "orange",
              },
            }}
            onClick={openEditDialog}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  )
}

export default SupplierDetailCard