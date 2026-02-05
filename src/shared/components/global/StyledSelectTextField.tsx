import React from "react";
import { TextField } from "@mui/material";

interface StyledSelectTextFieldProps extends React.ComponentProps<typeof TextField> {
    bgColor: string;
    readOnly?: boolean
}

export const StyledSelectTextField: React.FC<StyledSelectTextFieldProps> = ({ bgColor, readOnly, ...rest }) => {
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
                input: {
                    readOnly: readOnly
                }
            }}
        >
            {rest.children}
        </TextField>
    );
};