import { Box, Card, CardContent, Typography } from "@mui/material";

/**
 * 倉庫カードコンポーネント
 * 
 * アイコン、値、およびラベルを表示する
 * 
 * @param icon - アイコンコンポーネント
 * @param value - 値（数値または文字列）
 * @param label - ラベル名
 */
interface WarehouseCardProps {
    icon: React.ElementType;
    value: number | string;
    label: string;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({ icon: Icon, value, label }) => {
    return (
        <Card>
            <Box>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Icon sx={{ fontSize: 40 }} />
                    <Typography component="div" variant="h5">
                        {value}
                    </Typography>
                    <Typography variant="subtitle1" component="div" sx={{ color: 'text.secondary' }}>
                        {label}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
}

export default WarehouseCard