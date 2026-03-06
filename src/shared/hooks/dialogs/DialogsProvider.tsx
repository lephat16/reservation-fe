import { useCallback, useState, type ReactNode } from "react";
import DialogsContext from "./DialogsContext";
import { DeleteConfirmDialog, EditConfirmDialog } from "./useDialogs";

interface ConfirmState<T = unknown> {
    open: boolean;
    message?: string;
    data?: T;
    resolve?: (value: T) => void;
}

export default function DialogsProvider({
    children
}: { children: ReactNode }) {
    // DELETE STATE
    const [deleteState, setDeleteState] = useState<ConfirmState<boolean>>({
        open: false,
        message: "",
    });

    // EDIT STATE
    const [editState, setEditState] = useState<ConfirmState<unknown>>({
        open: false,
        data: null,
    });

    // DELETE FUNCTION
    const confirmDelete = useCallback((message: string) => {
        return new Promise<boolean>((resolve) => {
            setDeleteState({
                open: true,
                message,
                resolve,
            });
        });
    }, []);

    const openEdit = useCallback(<T,>(data: T) => {
        return new Promise<T | null>((resolve) => {
            setEditState({
                open: true,
                data,
                resolve: resolve as (value: unknown) => void,
            });
        });
    }, []);
    const handleDeleteClose = (result: boolean) => {
        const resolver = deleteState.resolve;

        setDeleteState(prev => ({
            ...prev,
            open: false,
        }));

        resolver?.(result);
    };

    const handleEditClose = (result: unknown) => {
        editState.resolve?.(result);
        setEditState({
            open: false,
            data: null,
        });
    };

    return (
        <DialogsContext.Provider
            value={{ confirmDelete, openEdit }}
        >
            {children}

            <DeleteConfirmDialog
                open={deleteState.open}
                message={deleteState.message || ""}
                onClose={handleDeleteClose}
            />

            <EditConfirmDialog
                open={editState.open}
                data={editState.data as { name: string }}
                onClose={handleEditClose}
            />
        </DialogsContext.Provider>
    )
}