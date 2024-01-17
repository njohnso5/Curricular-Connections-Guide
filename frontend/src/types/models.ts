export type Role = {
    id: number
    role: string
}

export type User = {
    id: number
    unity_id: string;
    role: Role;
}