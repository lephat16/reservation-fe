import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductFormData } from "../types/product";
import { productAPI } from "../api/productAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { getErrorMessage } from "../../../shared/utils/errorHandler";

interface UseAddProductOptions {
    onSuccess?: (response: any) => void;
    onError?: (error: unknown) => void;
}

export const useAddProduct = (
    showSnackbar: (message: string, severity: "success" | "error") => void,
    options?: UseAddProductOptions
) => {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: async (data: ProductFormData) => productAPI.createProduct(data),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.CREATE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["stock-with-supplier"] });
            if (options?.onSuccess) options.onSuccess(response);
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || SNACKBAR_MESSAGES.CREATE_FAILED, "error");
            if (options?.onError) options.onError(error);
        }
    });

    return addMutation;
};