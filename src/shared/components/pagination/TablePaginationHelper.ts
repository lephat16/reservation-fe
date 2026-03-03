
export const getCommonSlotProps = (isSM: boolean) => ({
    select: {
        inputProps: {
            'aria-label': 'ページあたりの行数',
        },
        native: true,
    },
    selectLabel: {
        sx: {
            display: isSM ? "none" : "block"
        }
    }
});