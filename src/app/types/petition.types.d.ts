type Petition = {
    id: number;
    title: string;
    description: string;
    creationDate: Date;
    imageFilename: string;
    ownerId: number;
    categoryId: number;
}

type PetitionSearch = {
    q?: string;
    ownerId?: string;
    supporterId?: string;
    startIndex?: string;
    count?: string;
    supportingCost?: string;
    sortBy?: "ALPHABETICAL_ASC" | "ALPHABETICAL_DESC" | "COST_ASC" | "COST_DESC" | "CREATED_ASC" | "CREATED_DESC";
    categoryIds?: string[];
}

type PetitionQuery = {
    sql: string;
    params: any[];
}

type PetitionReturn = {
    petitions: Petition[];
    count: number;
}

type PetitionAdd = {
    title: string;
    description: string;
    categoryId: number;
    supportTiers: SupportTierPost[];
}

type PetitionPost = {
    title: string;
    description: string;
    creationDate: Date;
    ownerId: number;
    categoryId: number;
}

type PetitionPatch = {
    title?: string;
    description?: string;
    categoryId?: number;
}

type PetitionGet = {
    description: string;
    moneyRaised: number;
    supportTiers: SupportTierGet[];
    petitionId: number;
    title: string;
    categoryId: number;
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    creationDate: Date;
}

type Category = {
    categoryId: number;
    name: string;
}