import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

type DashboardCardProps = {
    title: string;
    quantity: string;
    color?: string;
}



export default function DasboardCard({ title, quantity, color }: DashboardCardProps) {
    return (
        <Box sx={{
            maxWidth: 200,
        }}>
            <Card
                sx={{
                    backgroundColor: "#1e293b",
                }}>
                <CardContent>
                    <Typography component="div" gutterBottom color="#f3f4f6">
                        {title}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ color: color || 'text.primary' }}>
                        {quantity}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
