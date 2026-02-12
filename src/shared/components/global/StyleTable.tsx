import { tokens } from "../../theme";

type ColorTokens = ReturnType<typeof tokens>
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
            backgroundColor: options?.rowHoverBg ?? colors.primary[300],
        },
    },
    '& .MuiTableCell-root': {
        color: colors.grey[100],
        padding: options?.cellPadding ?? "8px 16px",
        borderBottom: `1px solid ${colors.grey[700]}`,
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
        backgroundColor: options?.headerBg ?? colors.primary[500],
        color: colors.grey[100],
        fontWeight: 600,
    },
});
