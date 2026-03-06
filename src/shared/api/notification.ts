import type { ApiResponse } from "..";
import type { NotificationResponse } from "../types/shared";
import { api } from "./axiosClient";

const NotificationApi = {

    /** 全ての通知を取得  */
    getNotificationsForUser: async (userId: number): Promise<ApiResponse<NotificationResponse[]>> => {
        return (await api.get(`/api/notification/all`, { params: { userId } })).data;
    },

    /** 未読通知の件数を取得 */
    getUnreadCount: async (userId: number): Promise<ApiResponse<number>> => {
        return (await api.get(`/api/notification/unread-count`, { params: { userId } })).data;
    },

    /** 通知を既読にする  */
    markAsRead: async (id: number): Promise<ApiResponse<NotificationResponse>> => {
        return (await api.post(`/api/notification/mark-read`, null, { params: { id } })).data;
    },

    /** 新しい通知を作成する  */
    createNotification: async (notification: NotificationResponse): Promise<ApiResponse<NotificationResponse>> => {
        return (await api.post(`/api/notification/create`, notification)).data;
    },

};

export default NotificationApi;