
import React, { useState } from 'react'
import type { ProductData } from '../types/product'
import { Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { tokens } from '../../../shared/theme'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { STATUS } from '../../../constants/status';

/** 
 * 商品詳細カードコンポーネント
 * 
 * 商品の基本情報、ステータス、カテゴリーを表示する
 * 
 * @param product - 商品データ
 * @param openDeleteDialog - 削除ダイアログを開くコールバック
 * @param openEditDialog - 編集ダイアログを開くコールバック
 */

type ProductDetailCardProps = {
  product: ProductData,
  openDeleteDialog: () => void,
  openEditDialog: () => void
}
const ProductDetailCard: React.FC<ProductDetailCardProps> = ({
  product,
  openDeleteDialog,
  openEditDialog,
}) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [showMore, setShowMore] = useState(false);

  return (
    <Card sx={{ mb: 2, backgroundColor: colors.primary[400] }}>
      <CardContent>
        {/** 商品名を表示する見出し */}
        <Typography
          component="div"
          variant="h5"
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          {product.productName}
        </Typography>
        {/** 商品コードを表示 */}
        <Typography variant="body2" color="text.secondary">
          商品コード:  {product.code}
        </Typography>
        {/** 在庫合計を表示 */}
        <Typography variant="body2" color="text.secondary">
          {`在庫合計: ${product.totalStock}${product.unit}`}
        </Typography>
        {/** カテゴリー名を表示 */}
        <Typography>カテゴリ: {product.categoryName}</Typography>
        {/** ステータスチップと操作ボタン（削除・編集）を横並びに表示 */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} mt={1}>
          <Chip
            label={STATUS[product.status].label}
            color={STATUS[product.status].color}
            size="small"
          />
          {/** 削除ボタン */}
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
          {/** 編集ボタン */}
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
        {/** 商品説明テキスト
         * クリックで全文表示/折りたたみ切り替え
         * WebkitLineClampで2行表示に制限、showMoreで制御
         */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 1,
            display: '-webkit-box',
            WebkitLineClamp: showMore ? 'none' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer'
          }}
          onClick={() => setShowMore(!showMore)}
        >
          {product.description}
        </Typography>

      </CardContent>
    </Card>
  )
}

export default ProductDetailCard