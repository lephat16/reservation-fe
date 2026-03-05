type MenuColorProps = {
    backgroundColor: string;
    color: string;
};

export const getCommonMenuProps = ({
    backgroundColor,
    color,
}: MenuColorProps) => ({
    PaperProps: {
        sx: {
            backgroundColor,
            color,
            minWidth: 200,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
        }
    }
});