import { Box, Card, CardContent, Typography } from "@mui/material";

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