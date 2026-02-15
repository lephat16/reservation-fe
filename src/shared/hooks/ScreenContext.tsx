
import { createContext, useContext } from "react";
import { useTheme, useMediaQuery } from "@mui/material";

type ScreenContextType = {
    isSM: boolean;
    isMD: boolean;
    isLG: boolean;
};
const ScreenContext = createContext<ScreenContextType>({
    isSM: false,
    isMD: false,
    isLG: false,
});

export const useScreen = () => useContext(ScreenContext);

export const ScreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const isSM = useMediaQuery(theme.breakpoints.down("sm"));
    const isMD = useMediaQuery(theme.breakpoints.down("md"));
    const isLG = useMediaQuery(theme.breakpoints.down("lg"));

    return (
        <ScreenContext.Provider value={{ isSM, isMD, isLG }}>
            {children}
        </ScreenContext.Provider>
    );
};