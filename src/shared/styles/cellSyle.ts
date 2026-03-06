import type { SxProps, Theme } from "@mui/material";

// テーブルセルのスタイル関数（右寄せや省略表示など）
export const cellStyle = (align?: "right" | "center", truncate?: boolean): SxProps<Theme> => ({
    textAlign: align,
    whiteSpace: truncate ? "nowrap" : "normal",
    overflow: truncate ? "hidden" : "visible",
    textOverflow: truncate ? "ellipsis" : "clip",
});