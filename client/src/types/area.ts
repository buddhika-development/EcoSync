// Types for area management

export interface AreaCollector {
    user_first_name: string;
    user_last_name: string;
}

export interface Area {
    area_id: string;
    area_name: string;
    collector_id: string;
    collector: AreaCollector;
}

export interface AreasResponse {
    ok: boolean;
    message: string;
    data: Area[];
}
