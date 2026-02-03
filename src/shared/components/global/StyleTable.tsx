
export const styledTable = (mode: "light" | "dark") => ({
    backgroundColor: mode === 'light' ? '#f8fafc' : '#334155',
    '& .MuiTableRow-root': {
        '&:hover': {
            backgroundColor: mode === 'light' ? '#e0e7ff' : '#1f2937',
        },
    },
    '& .MuiTableCell-root': {
        color: mode === 'light' ? '#000' : '#fff',
        padding: '8px 16px',
    },
    '& .MuiTableHead-root .MuiTableCell-root' : {
        backgroundColor: mode === 'light' ? '#eaeff5' : '#1e293b',
        color: mode === 'light' ? '#000' : '#fff',
    },
});
