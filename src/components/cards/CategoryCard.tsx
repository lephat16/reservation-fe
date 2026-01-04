import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import './CategoryCard.css'
import { useState } from "react";
import { Popover } from "@mui/material";

type CategoryCardProps = {
    name: string;
    status: "ACTIVE" | "INACTIVE";
    description: string;
    imageUrl?: string | null;
}
export default function CategoryCard({ name, status, description, imageUrl }: CategoryCardProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };
    const handlePopoverClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    return (
        <Card className="category-card">
            <CardActionArea
                className="category-card-action"
            >
                <CardMedia
                    component="img"
                    image={imageUrl || "/images/no-image.png"}
                    alt={name}
                    className="category-card-media"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                    }}
                />
                <CardContent className="category-card-content">
                    <Typography className="category-card-name" gutterBottom variant="h5" component="div">
                        {name}
                    </Typography>
                    <Typography
                        className="category-card-status"
                        sx={{ fontSize: '12px', fontWeight: 'bold', }}
                        color={status === 'ACTIVE' ? 'success' : 'error'}>
                        {status}
                    </Typography>
                    <Typography
                        className="category-card-description"
                        variant="body1"
                        aria-owns={open ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                    >
                        {description}
                    </Typography>
                    <Popover
                        id="mouse-over-popover"
                        sx={{ pointerEvents: 'none' }}
                        open={open}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus={true}
                    >
                        <Typography sx={{ p: 1, width: '200px' }}>{description}</Typography>

                    </Popover>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}