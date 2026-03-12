import { useEffect, useState } from "react";
import { Box, Button, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, styled } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from '@mui/icons-material/Cancel';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { useScreen } from "../../../shared/hooks/ScreenContext";
/**
 * FileInput コンポーネント
 *
 * ファイルのアップロードまたはURL入力による画像選択用コンポーネントです。
 * 選択された画像はプレビュー表示され、クリアボタンでリセット可能です。
 *
 * Props:
 * @param value - 現在選択されている画像（File オブジェクト、URL文字列、または null）
 * @param onChange - 画像変更時に呼ばれるコールバック。引数に File | string | null が渡されます
 * @param error - エラーメッセージ（フォームバリデーション用）
 */

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

    const { isSM } = useScreen();
    // プレビュー用の画像URL
    const [preview, setPreview] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");

    /**
    * value が変更された時の処理
    * - File オブジェクトなら URL.createObjectURL でプレビュー生成
    * - 文字列(URL)ならそのままプレビューとして表示
    * - nullならプレビューをクリア
    */
    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url); // メモリ解放
        } else if (typeof value === "string") {
            if (value.startsWith("/uploads")) {
                // ローカルサーバーにアップロード済みの画像の場合、環境変数のベースURLを付与
                const imageUrl = `${import.meta.env.VITE_IMG_URL}${value}`;
                setPreview(imageUrl);
                return;
            }
            // URL文字列を入力している場合
            setUrlInput(value);
            setPreview(value);

        } else {
            setPreview(null);
        }
    }, [value]);

    /** URL入力の状態を更新 */
    const handleUrlChange = (url: string) => {
        setUrlInput(url);
    };
    /** プレビューとURL入力をクリアする */
    const handleClear = () => {
        setUrlInput("");
        setPreview(null);
        onChange(null);
    }
    /** URL入力を確定して onChange コールバックに渡す */
    const handlePasteUrl = async () => {
        onChange(urlInput);
    };

    return (
        <Box mb={2}>
            <Stack direction="row" gap={3}>
                {/* ファイルアップロードボタン */}
                <Box alignContent="center">
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} >
                        {!isSM ? "ファイルをアップロード" : ""}
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
                {/* プレビュー表示用ボックス */}
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
                    {/* プレビュー画像がある場合はクリアボタンを表示 */}
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
            {/* URL入力フォーム */}
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
