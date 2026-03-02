import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react'
import type { ProductDetailData } from '../types/product';

/** 
 * ミニ商品カードコンポーネント
 * 
 * 小さなカード形式で商品ステータスやアイコンを表示
 * 
 * @param icon - 商品カードに表示するアイコンコンポーネント
 * @param product - 表示する商品詳細データ
 */
type ProductMiniDBItemProps = {
    icon: React.ElementType;
    product: ProductDetailData;
}
const ProductMiniDBItem: React.FC<ProductMiniDBItemProps> = ({ product, icon: Icon }) => {
    return (

        /** 商品カード全体 */
        <Card>
            <Box>
                {/** カードコンテンツ：縦方向にアイコン、ステータス、ラベルを配置 */}
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Icon sx={{ fontSize: 40 }} />
                    {/** 商品ステータスを表示 */}
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