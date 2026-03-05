export const STATUS = {
    ACTIVE: {
        value: 'ACTIVE',
        label: "稼働中",
        color: "success"
    },
    INACTIVE: {
        value: 'INACTIVE',
        label: "停止中",
        color: "error"
    },
    UNKNOWN: {
        label: "不明",
        color: "default"
    },
} as const;

export const SESSION_STATUS = {
    ACTIVE: {
        value: 'ACTIVE',
        label: "使用中",
        color: "success"
    },
    EXPIRED: {
        value: 'EXPIRED',
        label: "期限切れ",
        color: "warning"
    },
    REVOKED: {
        value: 'REVOKED',
        label: "無効化",
        color: "error"
    },
} as const;

export const ORDER_STATUS = {
    NEW: {
        value: 'NEW',
        label: "未処理",
        color: "secondary"
    },
    PENDING: {
        value: 'PENDING',
        label: "承認待ち",
        color: "warning"
    },
    PROCESSING: {
        value: 'PROCESSING',
        label: "作業中",
        color: "primary"
    },
    COMPLETED: {
        value: 'COMPLETED',
        label: "完了",
        color: "success"
    },
    CANCELLED: {
        value: 'CANCELLED',
        label: "取消",
        color: "error"
    },
} as const;

export const LOGIN_STATUS = {
    SUCCESS: {
        value: 'SUCCESS',
        label: "成功",
        color: "success"
    },
    FAILED: {
        value: 'FAILED',
        label: "失敗",
        color: "error"
    }
} as const;