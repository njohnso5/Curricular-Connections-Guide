interface AdminLog {
    id: number;
    unity_id: string,
    call: string,
    datetime: string;
}
interface UserLog {
    id: number;
    querySearch: string;
    datetime: string;
}

export type {
    AdminLog,
    UserLog
}