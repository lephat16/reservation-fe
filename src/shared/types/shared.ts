import type { tokens } from "../theme";

export type ColorTokens = ReturnType<typeof tokens>;

export type Column<T> = {
    key: keyof T | "action";
    label: string;
    width: string;
    sortable?: boolean;
    align?: "right" | "center";
    truncate?: boolean;
    hideOnMobile?: boolean;
    render?: (row: T) => React.ReactNode;
};
export type NotificationType = "ORDER" | "STOCK" | "TASK";
export type NotificationResponse = {
    id: number;
    title: string;
    userId: number;
    message: string;
    type: NotificationType;
    link: string;
    readed: boolean
    createdAt: string;
}