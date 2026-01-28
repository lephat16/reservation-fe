import { useEffect, useState } from "react";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography, styled, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from '@mui/icons-material/Cancel';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { tokens } from "../../../shared/theme";
const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    width: 1,
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
});

type FileInputProps = {
    value: File | string | null;
    onChange: (file: File | string | null) => void;
    error?: string;
};

export default function FileInput({ value, onChange, error }: FileInputProps) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [preview, setPreview] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");

    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof value === "string") {
            if (value.startsWith("/uploads")) {
                const imageUrl = `http://localhost:8081${value}`;

                setPreview(imageUrl);
                return;
            }
            setUrlInput(value);
            setPreview(value);

        } else {
            setPreview(null);
        }
    }, [value]);

    const handleUrlChange = (url: string) => {
        setUrlInput(url);
        onChange(url);
    };
    const handleClear = () => {
        setUrlInput("");
        setPreview(null);
        onChange(null);
    }

    const handlePasteUrl = async () => {
        try {
        
            const text = await navigator.clipboard.readText();
            setUrlInput(text); 
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    };

    return (
        <Box mb={2}>
            <Box sx={{ mt: 1 }}>
                <TextField
                    type="text"
                    fullWidth
                    placeholder="Or paste image URL"
                    value={urlInput}
                    onChange={e => handleUrlChange(e.target.value)}
                    sx={{ mb: 1 }}
                    error={!!error}
                    helperText={error ? error : ''}
                    disabled={value instanceof File}

                />
                <FormControl variant="outlined" fullWidth>
                    <InputLabel
                        htmlFor="outlined-adornment-url"
                        sx={{
                            color: colors.grey[100],
                            '&.Mui-focused': {
                                color: colors.grey[200],
                            },
                        }}
                    >
                        url.
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-url"
                        type={urlInput ? 'text' : 'url'}
                        label="url"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handlePasteUrl}
                                    edge="end"
                                >

                                </IconButton>
                                <ContentPasteGoIcon />
                            </InputAdornment>
                        }
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.grey[600],
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.grey[400],
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.grey[200],
                            },
                        }}
                    >

                    </OutlinedInput>
                </FormControl>
            </Box>
            <Stack direction="row" gap={3}>
                <Box alignContent="center">
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} >
                        Upload files
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                e.target.value = "";
                                onChange(file);
                            }}
                        />
                    </Button>
                </Box>

                <Box
                    sx={{
                        width: 200,
                        height: 200,
                        border: "2px dashed gray",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative"
                    }}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            Preview image here
                        </Typography>
                    )}

                    {preview && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: -4,
                                right: -4,
                            }}
                        >
                            <IconButton
                                color="error"
                                aria-label="clear"
                                onClick={handleClear}
                            >
                                <CancelIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>


            </Stack>
        </Box>
    );
}
