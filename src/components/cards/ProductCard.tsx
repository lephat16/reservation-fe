import React, { type SyntheticEvent } from "react";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Divider, Stack, styled, Typography, useTheme, type ButtonProps } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import type { SupplierData } from "../../types";
import { tokens } from "../../theme";

type ProductCardProps = {
  productName: string;
  code: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  totalStock: number;
  categoryName: string;
  supplier: SupplierData[];
};

const ColorButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(blue[800]),
  backgroundColor: blue[800],
  '&:hover': {
    backgroundColor: blue[900],
  },
}));
const ProductCard: React.FC<ProductCardProps> = ({
  productName,
  code,
  categoryName,
  totalStock,
  status,
  supplier = [] }) => {

  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (

    <Card
      sx={{
        backgroundColor: colors.greenAccent[800],
        maxWidth: 272,
        width: '100%',
        height: 360,
        display: "flex",
        flexDirection: "column",
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        }
      }}
    >

      <CardContent
        sx={{ flexGrow: 1 }}
      >
        <Typography
          fontSize={20}
          fontWeight={700}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            minHeight: '4rem',
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: 'break-word',
            mb: 1
          }}
        >
          {productName}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Stack
          gap={1}
          mb={1}
          color={colors.grey[200]}
        >

          <Typography variant="body2">Product Code: {code}</Typography>
          <Typography variant="body2">Category: {categoryName}</Typography>
          <Typography variant="body2">Total Stock: {totalStock}</Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 900,
            color: status === "ACTIVE" ? "green" : "red",
            textTransform: "uppercase",
          }}
        >{status}</Typography>

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Suppliers & Prices:</Typography>
        <Box sx={{ height: 60, overflowY: "auto" }}>
          {supplier.length > 0 ? (
            supplier.map((s, i) => (
              <Typography key={i} variant="body2">
                {s.supplierName}: ¥{s.price.toLocaleString()}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No supplier
            </Typography>
          )}
        </Box>


        <CardActions sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button variant="contained" size="small">VIEW</Button>
          <Button variant="outlined" size="small">EDIT</Button>
          <Button variant="outlined" color="error" size="small">DELETE</Button>
        </CardActions>
      </CardContent>



    </Card >
  );
};

export default ProductCard;
