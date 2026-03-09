import type { ApiResponse } from "..";
import type { NotificationResponse } from "../types/shared";
import { api } from "./axiosClient";

const notificationAPI = {

    /** 全ての通知を取得  */
    getNotificationsForUser: async (userId: number): Promise<ApiResponse<NotificationResponse[]>> => {
        return (await api.get(`/all-notifications`, { params: { userId } }));
    },

    /** 未読通知の件数を取得 */
    getUnreadCount: async (userId: number): Promise<ApiResponse<number>> => {
        return (await api.get(`/notification/unread-count`, { params: { userId } }));
    },

    /** 通知を既読にする  */
    markAsRead: async (id: number): Promise<ApiResponse<NotificationResponse>> => {
        return (await api.post(`/notification/mark-read`, null, { params: { id } }));
    },
    /** すべて通知を既読にする  */
    markReadAllNotification: async (userId: number): Promise<ApiResponse<void>> => {
        return (await api.post(`/notification/mark-read-all`, null, { params: { userId } }));
    },
    deleteNotification: async (id: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/${id}/delete-notification`,));
    },

};

export default notificationAPI;