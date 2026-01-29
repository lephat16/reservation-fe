import React from "react";
import { TextField } from "@mui/material";

interface StyledSelectTextFieldProps extends React.ComponentProps<typeof TextField> {
    bgColor: string;
}

export const StyledSelectTextField: React.FC<StyledSelectTextFieldProps> = ({ bgColor, ...rest }) => {
    return (
        <TextField
            {...rest}
            slotProps={{
                select: {
                    MenuProps: {
                        PaperProps: {
                            style: {
                                backgroundColor: bgColor,
                            },
                        },
                    },
                },
            }}
        >
            {rest.children}
        </TextField>
    );
};