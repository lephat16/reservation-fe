import React from "react";
import { Card, CardContent, Chip, Typography, Box, Stack } from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';

type SupplierCardProps = {
  name: string;
  contactInfo: string;
  address: string;
  status: string;
};

const SupplierCard: React.FC<SupplierCardProps> = ({
  name,
  contactInfo,
  address,
  status,
}) => {
  return (
    <Card
      sx={{
        minHeight: 200,
        borderRadius: 2,
        boxShadow: 3,
        p: 2,
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          <Chip
            label={status}
            color={status === "ACTIVE" ? "success" : "error"}
            variant="filled"
            size="small"
          />
        </Box>

        <Stack spacing={1} mt={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalPhoneIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {contactInfo}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {address}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;
