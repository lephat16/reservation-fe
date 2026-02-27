
import { createContext } from "react";

export interface DialogContextValue {
    confirmDelete: (message: string) => Promise<boolean>;
    openEdit: <T>(data: T) => Promise<T | null>;
}

const DialogsContext = createContext<DialogContextValue | null>(null);

export default DialogsContext;