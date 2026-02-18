import { CssBaseline, Stack } from "@mui/material";
import { type JSX, type ReactNode } from "react";

type Props = {
    children: ReactNode;
};

const AuthLayout = ({ children }: Props): JSX.Element => {
    return (
        <>
            <CssBaseline enableColorScheme />
            <Stack
                direction="column"
                component="main"
                sx={[
                    {
                        justifyContent: "center",
                        height: "100%",
                        minHeight: "100vh",
                    },
                    (theme) => ({
                        "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            zIndex: -1,
                            inset: 0,
                            backgroundImage:
                                "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
                            backgroundRepeat: "no-repeat",
                            ...theme.applyStyles("dark", {
                                backgroundImage:
                                    "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
                            }),
                        },
                    }),
                ]}
            >
                <Stack
                    direction={{ xs: "column-reverse", md: "row" }}
                    sx={{
                        justifyContent: "center",
                        p: 2,
                        mx: "auto",
                    }}
                >
                    {children}
                </Stack>
            </Stack>
        </>
    );
};

export default AuthLayout;
