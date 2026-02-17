import { useTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs"
import type { Dispatch, SetStateAction } from "react"
import { tokens } from "../../../shared/theme";

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