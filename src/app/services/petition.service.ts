import * as Petitions from '../models/petition.model';
import * as Users from '../models/user.model';

enum SortOption {
    ALPHABETICAL_ASC = "ALPHABETICAL_ASC",
    ALPHABETICAL_DESC = "ALPHABETICAL_DESC",
    COST_ASC = "COST_ASC",
    COST_DESC = "COST_DESC",
    CREATED_ASC = "CREATED_ASC",
    CREATED_DESC = "CREATED_DESC"
}

const getPetitionGet = async (petition: Petition): Promise<PetitionGet> => {
    // Get information
    const supportTierList: SupportTierGet[] = await Petitions.getSupportTiersByCategory(petition.id);
    const owner: User = await Users.getUserById(petition.ownerId);
    const supporterInfo: SupporterInfo = await Petitions.getSupporterInfo(petition.id);

    // Convert to proper type
    const petitionGet: PetitionGet = {
        description: petition.description,
        moneyRaised: supporterInfo.fundsRaised,
        supportTiers: supportTierList,
        petitionId: petition.id,
        title: petition.title,
        categoryId: petition.categoryId,
        ownerId: petition.ownerId,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        numberOfSupporters: supporterInfo.supporterCount,
        creationDate: petition.creationDate
    };

    return petitionGet;
}

const getPetitionQuery = async  (search: PetitionSearch, petitions: Petition[]): Promise<PetitionReturn> => {
    // Check start index
    let startIndex = 0;
    if (search.startIndex != null) {
        startIndex = parseInt(search.startIndex, 10);
    }

    // Check end index
    let endIndex = petitions.length;
    if (search.startIndex != null) {
        endIndex = parseInt(search.count, 10) + startIndex;
    }

    // Slice petitions
    const pagedPetitions = petitions.slice(startIndex, endIndex);

    // Create query

    return {"petitions": pagedPetitions, "count": petitions.length};
}

const getQuery = async (search: PetitionSearch): Promise<PetitionQuery> => {
    // Get query params
    const queryParams = await getParams(search)

    // Create the query string
    const sqlString =
        'with supporting_costs as (' +
        '   SELECT st.petition_id,' +
        '          MIN(st.cost) as supportingCost' +
        '   FROM support_tier st' +
        '   GROUP BY st.petition_id)' +
        ' ' +
        ', supporter_counts as (' +
        '   SELECT s.petition_id,' +
        '          COUNT(s.id) as numberOfSupporters' +
        '   FROM supporter s' +
        '   GROUP BY s.petition_id)' +
        ' ' +
        'SELECT p.id as petitionId,' +
        '       p.title,' +
        '       p.category_id as categoryId,' +
        '       p.owner_id as ownerId,' +
        '       u.first_name as ownerFirstName,' +
        '       u.last_name as ownerLastName,' +
        '       p.creation_date as creationDate,' +
        '       s.numberOfSupporters,' +
        '       sc.supportingCost ' +
        'FROM petition p ' +
        'INNER JOIN' +
        '    user u ON p.owner_id = u.id ' +
        'INNER JOIN' +
        '    supporting_costs sc ON p.id = sc.petition_id ' +
        'INNER JOIN' +
        '    supporter_counts s ON p.id = s.petition_id ' +
        'WHERE' +
        '   (? = -1 OR p.title LIKE ? OR p.description LIKE ?) AND' +
        '   (? = -1 OR p.owner_id = ?) AND' +
        '   (? = -1 OR EXISTS(SELECT 1 FROM supporter sp WHERE sp.petition_id = p.id AND sp.user_id = ?)) AND' +
        '   (? = -1 OR sc.supportingCost <= ?) AND' +
        '   (? = -1 OR p.category_id IN (?' + ', ?'.repeat((search.categoryIds != null ? (search.categoryIds.length - 1): 0)) + ')) ' +
        await getOrderBy(search.sortBy);

    // Return the query object
    return {sql: sqlString, params: queryParams};
}

const getOrderBy = async (sortOption: string): Promise<string> => {
    // Create variable to return
    let orderByClause = '';

    // Set default value
    if (!sortOption) {
        sortOption = '';
    }

    // Find sorting option
    switch (sortOption) {
        case SortOption.ALPHABETICAL_ASC:
            orderByClause = 'ORDER BY title ASC';
            break;
        case SortOption.ALPHABETICAL_DESC:
            orderByClause = 'ORDER BY title DESC';
            break;
        case SortOption.COST_ASC:
            orderByClause = 'ORDER BY supportingCost ASC';
            break;
        case SortOption.COST_DESC:
            orderByClause = 'ORDER BY supportingCost DESC';
            break;
        case SortOption.CREATED_ASC:
            orderByClause = 'ORDER BY creationDate ASC';
            break;
        case SortOption.CREATED_DESC:
            orderByClause = 'ORDER BY creationDate DESC';
            break;
        default:
            // Default sort oldest to newest
            orderByClause = 'ORDER BY creationDate ASC';
            break;
    }

    // Return the order by string
    return orderByClause + ", p.id ASC ";
}

const getParams = async (search: PetitionSearch): Promise<any[]> => {
    // Create array of -1's
    const params: any[] = Array(11).fill(-1);

    // Check the q
    if (search.q != null) {
        params[0] = 1;
        params[1] = '%' + search.q + '%';
        params[2] = '%' + search.q + '%';
    }

    // Check the owner id
    if (search.ownerId != null) {
        params[3] = 1;
        params[4] = parseInt(search.ownerId, 10);
    }

    // Check the supporter id
    if (search.supporterId != null) {
        params[5] = 1;
        params[6] = parseInt(search.supporterId, 10);
    }

    // Check the supporting cost
    if (search.supportingCost != null) {
        params[7] = 1;
        params[8] = parseInt(search.supportingCost, 10);
    }

    // Check the category id
    if (search.categoryIds != null) {
        params[9] = 1;
        params[10] = search.categoryIds;
    }

    // Return the filled out list
    return params.flat();
}

export {getPetitionGet, getPetitionQuery, getQuery}