
import { createContext, useContext } from "react";
import { useTheme, useMediaQuery } from "@mui/material";

type ScreenContextType = {
    isSM: boolean;
    isMD: boolean;
    isLG: boolean;
    isMdToLg: boolean;
};
const ScreenContext = createContext<ScreenContextType>({
    isSM: false,
    isMD: false,
    isLG: false,
    isMdToLg: false,
});

export const useScreen = () => useContext(ScreenContext);

export const ScreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const isSM = useMediaQuery(theme.breakpoints.down("sm"));
    const isMD = useMediaQuery(theme.breakpoints.down("md"));
    const isLG = useMediaQuery(theme.breakpoints.down("lg"));
    const isMdToLg = useMediaQuery(theme.breakpoints.between("md", "lg"));

    return (
        <ScreenContext.Provider value={{ isSM, isMD, isLG, isMdToLg }}>
            {children}
        </ScreenContext.Provider>
    );
};