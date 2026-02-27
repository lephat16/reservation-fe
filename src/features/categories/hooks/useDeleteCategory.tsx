import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryAPI } from "../api/categoryAPI";
import { SNACKBAR_MESSAGES } from "../../../constants/message";
import { getErrorMessage } from "../../../shared/utils/errorHandler";
import { useNavigate } from "react-router-dom";

export const useDeleteCategory = (
    showSnackbar: (message: string, severity: "success" | "error") => void) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => categoryAPI.deleteCategory(id),
        onSuccess: (response) => {
            showSnackbar(response.message || SNACKBAR_MESSAGES.DELETE_SUCCESS, "success");
            queryClient.invalidateQueries({ queryKey: ["category-summaries"] });
            navigate("/category");
        },
        onError: (error: unknown) => {
            showSnackbar(getErrorMessage(error) || "削除に失敗しました", "error");
        }
    });

    return deleteMutation;
};