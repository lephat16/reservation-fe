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