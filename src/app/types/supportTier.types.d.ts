type SupportTierPost = {
    title: string;
    description: string;
    cost: number;
}

type SupportTierGet = {
    supportTierId: number;
    title: string;
    description: string;
    cost: number;
}

type SupporterInfo = {
    supporterCount: number;
    fundsRaised: number;
}

type SupportTierPatch = {
    title?: string;
    description?: string;
    cost?: number;
}

type SupportTierReturn = {
    id: number;
    petitionId: number;
    title: string;
    description: string;
    cost: number;
}