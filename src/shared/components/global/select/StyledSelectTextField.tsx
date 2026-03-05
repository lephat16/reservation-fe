import React from "react";
import { TextField } from "@mui/material";

interface StyledSelectTextFieldProps extends React.ComponentProps<typeof TextField> {
    maxHeight?: number;
    bgColor: string;
    readOnly?: boolean;
    inputFontSize?: string;
    labelFontSize?: string;
}

export const StyledSelectTextField: React.FC<StyledSelectTextFieldProps> = ({
    maxHeight,
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
                                maxHeight: maxHeight,
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