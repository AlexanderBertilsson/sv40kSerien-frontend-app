export interface ArmyList {
    id: string;
    factionName: string | null;
    factionShortName: string | null;
    factionNormalizedName: string | null;
    detachmentName: string | null;
    description: string | null;
    list: string | null;
}

export interface DetachmentDto {
    id: number;
    name: string | null;
    active: boolean;
}

export interface FactionDto {
    id: number;
    name: string | null;
    shortName: string | null;
    normalizedName: string | null;
    detachments: DetachmentDto[] | null;
}

export interface CreateArmyListRequest {
    factionId: number;
    detachmentId?: number | null;
    description?: string | null;
    list?: string | null;
}

export interface UpdateArmyListRequest {
    factionId?: number | null;
    detachmentId?: number | null;
    description?: string | null;
    list?: string | null;
}
