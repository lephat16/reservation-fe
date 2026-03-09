import type { ColorTokens } from "../types/shared";

type StyledTableOptions = {
    cellPadding?: string;
    headerBg?: string;
    rowHoverBg: string;
}

export const styledTable = (
    colors: ColorTokens,
    options?: StyledTableOptions
) => ({
    backgroundColor: colors.primary[400],
    '& .MuiTableRow-root': {
        '&:hover': {
            backgroundColor: options?.rowHoverBg,
        },
    },
    '& .MuiTableCell-root': {
        color: colors.grey[100],
        padding: options?.cellPadding ?? "8px 16px",
        borderBottom: `1px solid ${colors.grey[700]}`,
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
        backgroundColor: options?.headerBg ?? colors.blueAccent[700],
        color: colors.grey[100],
        fontWeight: 600,
    },
    '& .MuiTablePagination-toolbar': {
        minHeight: 40
    },
});
