type Supporter = {
    supportId: number;
    supportTierId: number;
    message: string;
    supporterId: number;
    supporterFirstName: string;
    supporterLastName: string;
    timestamp: string;
};

type SupportPost = {
    supportTierId: number;
    message: string;
};

type Support = {
    id: number;
    petitionId: number;
    supportTierId: number;
    userId: number;
    message: string;
    timestamp: string;
};