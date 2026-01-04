import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import type { TransactionData } from '../../types';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';

const TransactionInfo = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface Props {
    data: TransactionData;
    open: boolean;
    onClose: () => void;
    onSave: (id: number, description: string, note: string) => void;
}

const TransactionCard = ({ data, open, onClose, onSave }: Props) => {

    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(data.description);
    const [note, setNote] = useState(data.note);

    useEffect(() => {
        setDescription(data.description);
        setNote(data.note);
    }, [data]);

    const handleEditClick = () => {
        setIsEditing(true);

    }
    const handleSave = () => {
        onSave(data.id, description, note);
        setIsEditing(false);
    };
    return (
        <TransactionInfo
            onClose={onClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                {data.username}
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                <Typography gutterBottom>
                    Created At: {data.createdAt}
                </Typography>
                {data.supplierName && (
                    <Typography gutterBottom>
                        Supplier name: {data.supplierName}
                    </Typography>
                )}
                {!isEditing ? (
                    <>
                        <Typography gutterBottom>
                            Description: {description}
                        </Typography>
                        <Typography gutterBottom>
                            Note: {note}
                        </Typography>
                        <IconButton size="small" onClick={handleEditClick}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            fullWidth
                            margin="dense"
                        />
                    </>
                )}

            </DialogContent>
            <DialogActions>
                {isEditing && (
                    <Button variant="contained" onClick={handleSave}>
                        保存
                    </Button>
                )}
                <Button onClick={() => {
                    onClose();
                    setIsEditing(false);
                }}>
                    閉じる
                </Button>
            </DialogActions>
        </TransactionInfo>
    );
}

export default TransactionCard;