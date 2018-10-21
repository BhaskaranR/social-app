
export type event_points = {
    id: number;
    event_name : string;
    event_category: string;
    event_subcategory: string;
    reward_type: string;
    reward_value: number;
    create_date: string;
    expired: number;
}

export type event = {
    id: number;
    person: string;
    action_id: number;
    event_id: number;
    created_at: string;
    expires_at: string;
}

export type reward_events = {
    id: number;
    reward: number;
    created_date: string;
    reason: string;
}