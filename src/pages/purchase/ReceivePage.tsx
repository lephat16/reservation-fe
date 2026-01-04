import { useParams } from "react-router-dom";
import type { PurchaseOrderData } from "../../types";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import ApiService from "../../services/ApiService";
import { useQuery } from "@tanstack/react-query";
import Header from "../../layout/Header";


const ReceivePage = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { poId } = useParams<{ poId: string }>();
    const { isLoading, error, data } = useQuery<PurchaseOrderData>({
        queryKey: ['purchaseOrderDetail', poId],
        queryFn: async () => {
            const resPODetail = await ApiService.getPurchaseOrderDetail(Number(poId));
            console.log(resPODetail);
            console.log(resPODetail.data);
            return resPODetail.data;
        },
        enabled: !!poId
    });
    return (
        <Box m={3}>
            <Header
                title={`注文番号: ${data?.supplierId ?? ""} | 仕入先: ${data?.supplierName ?? ""}`}
                subtitle={`ステータス: ${data?.status ?? ""} | 作成日: ${data?.createdAt ?? ""}`}
            />
            <Box mt={3} height="75vh">
            </Box>
        </Box>
    )
}

export default ReceivePage;