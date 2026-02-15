import { useEffect, useState } from "react";
import { Box, Button, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, styled } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from '@mui/icons-material/Cancel';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
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
    };
    const handleClear = () => {
        setUrlInput("");
        setPreview(null);
        onChange(null);
    }

    const handlePasteUrl = async () => {
        onChange(urlInput);
    };

    return (
        <Box mb={2}>
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
                        border: 2,
                        borderStyle: "dashed",
                        borderColor: error ? "error.main" : "gray",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="画像のプレビュー"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <DriveFolderUploadIcon sx={{ fontSize: 50 }} color="disabled" />
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
            <Box sx={{ mt: 2 }}>
                <FormControl variant="outlined" fullWidth error={!!error}>
                    <InputLabel
                        htmlFor="outlined-url"
                    >
                        URLからデータを読み取る
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-url"
                        type={urlInput ? 'text' : 'url'}
                        value={urlInput}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        label="URLからデータを読み取る"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handlePasteUrl}
                                    edge="end"
                                    disabled={!urlInput}
                                >

                                    <ContentPasteGoIcon color={error ? "error" : "primary"} />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText>
                        {error ?? " "}
                    </FormHelperText>
                </FormControl>

            </Box>
        </Box>
    );
}
