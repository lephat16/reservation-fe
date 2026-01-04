import { useQuery } from "@tanstack/react-query";
import ApiService from "../../services/ApiService";


const ProductPage = () => {


    const { isLoading, error, data } = useQuery({
        queryKey: ["products-and-categories"],
        queryFn: async () => {
            const productRes = await ApiService.getCategorySummariesById(1);
            console.log(productRes)
            return productRes.data;
        }
    });
    return (
        <div>
            a
        </div>
    )
}

export default ProductPage;