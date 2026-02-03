import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react'
import type { ProductDetailData } from '../types/product';
type ProductMiniDBItemProps = {
    icon: React.ElementType;
    product: ProductDetailData;
    // label: string;
}
const ProductMiniDBItem: React.FC<ProductMiniDBItemProps> = ({ product, icon: Icon }) => {
    return (
        <Card>
            <Box>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Icon sx={{ fontSize: 40 }} />
                    <Typography component="div" variant="h5">
                        {product.product.status}
                    </Typography>
                    <Typography variant="subtitle1" component="div" sx={{ color: 'text.secondary' }}>
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
}

export default ProductMiniDBItem