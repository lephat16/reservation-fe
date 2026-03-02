import type { Dispatch, SetStateAction } from "react";
import type { Type } from "./StockMovementHistoryPage"
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, useTheme, type SxProps, type Theme } from "@mui/material";
import { tokens } from "../../../shared/theme";

/** 
 * 在庫移動履歴ページ用フィルターコンポーネント
 * 
 * - 「区分」フィルター：全て / 入庫 / 出庫
 * - 「数量」フィルター：指定以上の数量を選択
 * 
 * @param type - 現在選択されている区分 (ALL, IN, OUT)
 * @param setType - 区分を更新する関数
 * @param minQty - 現在選択されている数量の最小値
 * @param setMinQty - 数量の最小値を更新する関数
 * @param sx - 追加のスタイル（MUI SxProps）
 */

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
            {/* 区分フィルター */}
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

            {/* 数量フィルター */}
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