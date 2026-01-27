import * as React from 'react';
import { NumberField as BaseNumberField } from '@base-ui-components/react/number-field';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './NumberField.css'
import { FormHelperText, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { styledSelect } from '../../styles/styledSelect';

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
    return null;
}
SSRInitialFilled.muiName = 'Input';

type NumberFieldProps = BaseNumberField.Root.Props & {
    label?: React.ReactNode;
    size?: 'small' | 'medium';
    error?: boolean;
    helperText?: React.ReactNode;
}

export default function NumberField({
    id: idProp,
    label,
    error,
    helperText,
    size = 'medium',
    ...other
}: NumberFieldProps) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    let id = React.useId();
    if (idProp) {
        id = idProp;
    }
    return (
        <BaseNumberField.Root
            allowWheelScrub
            {...other}
            render={(props, state) => (
                <FormControl
                    // size={size}
                    fullWidth
                    ref={props.ref}
                    disabled={state.disabled}
                    required={state.required}
                    error={error}
                    variant="outlined"
                >
                    {props.children}
                    {error && helperText && (
                        <FormHelperText>{helperText}</FormHelperText>
                    )}
                </FormControl>
            )}
        >
            <SSRInitialFilled {...other} />
            <InputLabel sx={{
                color: colors.grey[100],
                '&.Mui-focused': {
                    color: colors.grey[200],
                },
            }} htmlFor={id} >{label}</InputLabel>
            <BaseNumberField.Input
                id={id}
                render={(props, state) => (
                    <OutlinedInput
                        label={label}
                        inputRef={props.ref}
                        value={state.inputValue}
                        onBlur={props.onBlur}
                        onChange={props.onChange}
                        onKeyUp={props.onKeyUp}
                        onKeyDown={props.onKeyDown}
                        onFocus={props.onFocus}
                        slotProps={{
                            input: props,
                        }}
                        endAdornment={
                            <InputAdornment
                                position="end"
                                sx={{
                                    flexDirection: 'column',
                                    maxHeight: 'unset',
                                    alignSelf: 'stretch',
                                    borderLeft: '1px solid',
                                    borderColor: 'divider',
                                    ml: 0,
                                    '& button': {
                                        py: 0,
                                        flex: 1,
                                        borderRadius: 0.5,
                                    },
                                    border: 'none',

                                }}
                            >
                                <BaseNumberField.Increment
                                    render={<IconButton size={size} aria-label="Increase" />}
                                >
                                    <KeyboardArrowUpIcon
                                        fontSize={size}
                                        sx={{ transform: 'translateY(2px)' }}
                                    />
                                </BaseNumberField.Increment>

                                <BaseNumberField.Decrement
                                    render={<IconButton size={size} aria-label="Decrease" />}
                                >
                                    <KeyboardArrowDownIcon
                                        fontSize={size}
                                        sx={{ transform: 'translateY(-2px)' }}
                                    />
                                </BaseNumberField.Decrement>
                            </InputAdornment>
                        }
                        sx={{
                            pr: 0,
                            width: "100%",
                            "& input": {
                                color: error ? "#e53935" : "inherit"

                            },
                            ...styledSelect
                        }}
                    />
                )}
            />
        </BaseNumberField.Root>
    );
}
