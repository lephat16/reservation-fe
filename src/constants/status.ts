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