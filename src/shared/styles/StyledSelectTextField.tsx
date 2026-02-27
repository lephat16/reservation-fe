import React from "react";
import { TextField } from "@mui/material";

interface StyledSelectTextFieldProps extends React.ComponentProps<typeof TextField> {
    bgColor: string;
    readOnly?: boolean;
    inputFontSize?: string;
    labelFontSize?: string;
}

export const StyledSelectTextField: React.FC<StyledSelectTextFieldProps> = ({
    bgColor,
    readOnly,
    inputFontSize,
    labelFontSize,
    ...rest }) => {
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
                    readOnly: readOnly,
                    sx: {
                        fontSize: inputFontSize
                    }
                },
                inputLabel: {
                    sx: {
                        fontSize: labelFontSize
                    }
                }
            }}
        >
            {rest.children}
        </TextField>
    );
};