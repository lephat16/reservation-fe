import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryAPI } from "../api/categoryAPI";
import type { AxiosError } from "axios";
import { SNACKBAR_MESSAGES } from "../../../constants/message";

export const useDeleteCategory = (
    onSuccess: () => void,
    showSnackbar: (message: string, severity: "success" | "error") => void) => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => categoryAPI.deleteCategory(id),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["category-summaries"] });
            onSuccess();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showSnackbar(error.response?.data?.message || "削除に失敗しました", "error");
        }
    });

    return deleteMutation;
};