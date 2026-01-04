import { useMemo, useState } from "react";
import ApiService from "../../services/ApiService";
import { LineChart, CartesianGrid, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { TransactionData } from "../../types";
import { Box, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Stack, Typography } from "@mui/material";
import CurrencyYenIcon from '@mui/icons-material/CurrencyYen';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardCard from "../../components/cards/DashboardCard";

type DailyStat = {
    day: number;
    count: number;
    quantity: number;
    amount: number;
}

const transformTransactionData = (
    transactions: TransactionData[],
    month: number,
    year: number
) => {
    const dailyData: Record<number, DailyStat> = {};
    const daysInMonths = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonths; day++) {
        dailyData[day] = {
            day,
            count: 0,
            quantity: 0,
            amount: 0,
        }
    };

    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        const transactionMonth = transactionDate.getMonth() + 1;
        const transactionYear = transactionDate.getFullYear();

        if (transactionMonth == month && transactionYear == year) {
            const day = transactionDate.getDate();
            dailyData[day].count += 1;
            dailyData[day].quantity += transaction.totalProducts;
            dailyData[day].amount += transaction.totalPrice;
        }
    });
    return Object.values(dailyData);
}

const getLabelY = (dataKey: string) => {
    switch (dataKey) {
        case "count":
            return "取引数（個）";
        case "quantity":
            return "商品数量（個）";
        case "amount":
            return "全額（円）";
        default:
            return "";
    }
}

const DashboardPage = () => {

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedData, setSelectedData] = useState("amount");

    const { data: transactions, isLoading: transactionsIsLoading, error: transactionsError } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const transactionsRes = await ApiService.getAllTransations();

            return transactionsRes.transactions;
        },
        staleTime: 300000,
    });
    const { data: dashboardData, isLoading: dashboardIsLoading, error: dashboardError } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            return await ApiService.getDashboard();
        },
    });

    const chartData = useMemo(() => {
        console.log("useMemo executed");
        const daysInMonths = new Date(selectedYear, selectedMonth, 0).getDate();
        if (!transactions) {
            return Array.from({ length: daysInMonths }, (_, i) => ({
                day: i + 1,
                count: 0,
                quantity: 0,
                amount: 0,
            }));
        };

        return transformTransactionData(transactions, selectedMonth, selectedYear);
    }, [transactions, selectedMonth, selectedYear]);

    console.log(dashboardData)

    const handleMonthChange = (e: any) => {
        setSelectedMonth(parseInt(e.target.value, 10));
    }
    const handleYearChange = (e: any) => {
        setSelectedYear(parseInt(e.target.value, 10));
    }
    return (
       
                <Container maxWidth="lg" sx={{ py: 4, height: "100%" }}>
                    {/* ローディング表示 */}
                    {(transactionsIsLoading || dashboardIsLoading) && (
                        <Box textAlign="center" my={4}>
                            <CircularProgress />
                            <Typography>データを読み込み中...</Typography>
                        </Box>
                    )}

                    {/* エラー表示 */}
                    {(transactionsError || dashboardError) && (
                        <p className="error">データの取得に失敗しました。</p>
                    )}


                    <Stack direction="row" spacing={2} pb={2}>
                        {[
                            { key: "amount", label: "全額", icon: <CurrencyYenIcon /> },
                            { key: "count", label: "合計", icon: <ReceiptLongIcon /> },
                            { key: "quantity", label: "商品数量", icon: <InventoryIcon /> },
                        ].map((item) => (
                            <Button
                                key={item.key}
                                size="small"
                                variant={selectedData === item.key ? "contained" : "outlined"}
                                endIcon={item.icon}
                                onClick={() => setSelectedData(item.key)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Stack>
                    <Box mt={2}>
                        <Stack direction="row" justifyContent="space-between">
                            <Stack direction="column" spacing={2} pb={2}>
                                <FormControl sx={{ minWidth: "180px" }}>
                                    <InputLabel id="select-label-month">月を選択してください。</InputLabel>
                                    <Select
                                        labelId="select-label-month"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        input={<OutlinedInput label="月を選択してください。" />}
                                        label="Select Month"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <MenuItem value={i + 1} key={i + 1}>
                                                {new Date(0, i).toLocaleString("default", { month: "long" })}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: "150px" }}>
                                    <InputLabel id="select-label-year">年を選択してください。</InputLabel>
                                    <Select
                                        labelId="select-label-year"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        input={<OutlinedInput label="年を選択してください。" />}
                                        label="Select Year"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return (
                                                <MenuItem value={year} key={i + 1}>
                                                    {year}年
                                                </MenuItem>)
                                        }
                                        )}
                                    </Select>
                                </FormControl>

                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <DashboardCard title="今日売上" quantity={(dashboardData?.todaySales ?? 0).toLocaleString() + "円"} color="#f3f4f6" />
                                <DashboardCard title="今週の売上" quantity={(dashboardData?.weeklySales ?? 0).toLocaleString() + "円"} color="#f3f4f6" />
                                <DashboardCard title="在庫切れ" quantity={(dashboardData?.outOfStockCount ?? 0).toString()} color="#f3f4f6" />
                            </Stack>
                        </Stack>

                        <Box>
                            <Box mt={2}>
                                <ResponsiveContainer width="100%" height={400} >
                                    <LineChart data={chartData} >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="day"
                                            label={{
                                                value: "日",
                                                position: "insideBottomRight",
                                                offset: -5
                                            }}

                                        />
                                        <YAxis
                                            dataKey={selectedData}
                                            domain={['auto', 'auto']}
                                            label={{
                                                value: getLabelY(selectedData) || "全額（円）",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                            width="auto"
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type={"monotone"}
                                            dataKey={selectedData}
                                            name={getLabelY(selectedData)}
                                            stroke="#008080"
                                            fillOpacity={0.3}
                                            fill="#008080"
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>
                    </Box>

                </Container>
            
    )
}

export default DashboardPage