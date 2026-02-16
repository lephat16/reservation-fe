import type { Dispatch, SetStateAction } from "react";
import type { Type } from "./StockMovementHistoryPage"
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, useTheme, type SxProps, type Theme } from "@mui/material";
import { tokens } from "../../../shared/theme";

type FilterContentProps = {
    type: Type;
    setType: Dispatch<SetStateAction<Type>>;
    minQty: number;
    setMinQty: Dispatch<SetStateAction<number>>;
    sx?: SxProps<Theme>;
}

const FilterContent = ({
    type,
    setType,
    minQty,
    setMinQty,
    sx
}: FilterContentProps) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <>
            <FormControl sx={sx}>
                <InputLabel
                    id="-types-label"
                    sx={{
                        color: colors.grey[100],
                        '&.Mui-focused': {
                            color: colors.grey[200],
                        },
                    }}
                >区分</InputLabel>
                <Select
                    labelId="-types-label"
                    value={type}
                    onChange={e => {
                        setType(e.target.value as Type)
                    }}
                    input={<OutlinedInput label="区分" />}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backgroundColor: colors.blueAccent[800],
                                color: colors.grey[100],
                                minWidth: 200,
                                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                            }
                        }
                    }}
                >
                    <MenuItem value="ALL">
                        <em>全て</em>
                    </MenuItem>
                    <MenuItem value="IN">入庫</MenuItem>
                    <MenuItem value="OUT">出庫</MenuItem>
                </Select>
            </FormControl>

            <FormControl sx={sx}>
                <InputLabel
                    id="multiple-qty-label"
                    sx={{
                        color: colors.grey[100],
                        '&.Mui-focused': {
                            color: colors.grey[200],
                        },
                    }}
                >数量</InputLabel>
                <Select
                    labelId="multiple-qty-label"
                    id="multiple-qty"
                    value={minQty}
                    onChange={(e) => {
                        const value = e.target.value ? e.target.value : "";
                        if (value === null) {
                            setMinQty(value);
                        } else setMinQty(Number(value));
                    }}
                    input={<OutlinedInput label="数量" />}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backgroundColor: colors.blueAccent[800],
                                color: colors.grey[100],
                                minWidth: 200,
                                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                            }
                        }
                    }}
                >
                    <MenuItem value={0}>
                        <em>未選択</em>
                    </MenuItem>
                    <MenuItem value={5}>5以上</MenuItem>
                    <MenuItem value={10}>10以上</MenuItem>
                    <MenuItem value={20}>20以上</MenuItem>
                </Select>
            </FormControl>
        </>
    )
}

export default FilterContent;