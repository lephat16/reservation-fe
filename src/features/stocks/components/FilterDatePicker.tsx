import { useTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs"
import type { Dispatch, SetStateAction } from "react"
import { tokens } from "../../../shared/theme";

/** 
 * 日付フィルターコンポーネント
 * 
 * - 開始日・終了日を選択可能
 * - 親コンポーネントの状態 (startDate, endDate) を更新する
 * - Dayjs を使用して日付を管理
 * - MUI DatePicker にテーマカラーを適用
 * 
 * @param startDate - 選択中の開始日 (Dayjs または null)
 * @param endDate - 選択中の終了日 (Dayjs または null)
 * @param setStartDate - 開始日を更新する関数
 * @param setEndDate - 終了日を更新する関数
 */

type FilterDatePickerProps = {
    startDate: Dayjs | null,
    endDate: Dayjs | null,
    setStartDate: Dispatch<SetStateAction<Dayjs | null>>;
    setEndDate: Dispatch<SetStateAction<Dayjs | null>>;
}

const FilterDatePicker = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
}: FilterDatePickerProps) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
             {/* 開始日ピッカー */}
            <DatePicker
                label="開始日"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                sx={{ m: { lg: 1 }, maxWidth: { lg: 160 }, mt: { xs: 1 } }}
                slotProps={{
                    desktopPaper: {
                        style: {
                            backgroundColor: colors.blueAccent[800],
                        },
                    }
                }}
            />
             {/* 終了日ピッカー */}
            <DatePicker
                label="終了日"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                sx={{ m: { lg: 1 }, maxWidth: { lg: 160 }, mt: { xs: 1 } }}
                slotProps={{
                    desktopPaper: {
                        style: {
                            backgroundColor: colors.blueAccent[800],
                        },
                    }
                }}
            />
        </LocalizationProvider>
    )
}

export default FilterDatePicker;