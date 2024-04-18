import {getPool} from "../../config/db";
import {camelizeKeys} from "humps";
import * as PetitionService from '../services/petition.service';
import {ResultSetHeader} from "mysql2";

const insert = async (petition: PetitionPost): Promise<ResultSetHeader> => {
    const query = 'insert into petition (title, description, creation_date, owner_id, category_id) values ( ?, ?, ?, ?, ? )';
    const [result] = await getPool().query( query, [petition.title, petition.description, petition.creationDate, petition.ownerId, petition.categoryId]);
    return result;
};

const update = async (petition: PetitionPatch, petitionId: number): Promise<ResultSetHeader> => {
    const query = 'UPDATE petition SET title = ?, description = ?, category_id = ? WHERE id = ?';
    const [result] = await getPool().query(query, [petition.title, petition.description, petition.categoryId, petitionId]);
    return result;
};

const remove = async (petitionId: number): Promise<ResultSetHeader> => {
    const query = 'DELETE FROM petition WHERE id = ?';
    const [result] = await getPool().query(query, [petitionId]);
    return result;
};

const removeSupportTiers = async (petitionId: number): Promise<ResultSetHeader> => {
    const query = 'DELETE FROM support_tier WHERE petition_id = ?';
    const [result] = await getPool().query(query, [petitionId]);
    return result;
};

const insertSupportTier = async (support: SupportTierPost, petitionId: number): Promise<ResultSetHeader> => {
    const query = 'insert into support_tier (petition_id, title, description, cost) values ( ?, ?, ?, ? )';
    const [result] = await getPool().query( query, [petitionId, support.title, support.description, support.cost]);
    return result;
};

const searchPetitions = async (search: PetitionSearch): Promise<Petition[]> => {
    const query: PetitionQuery = await PetitionService.getQuery(search);
    const rows = await getPool().query(query.sql, query.params);
    return rows[0].length === 0 ? [] : rows[0].map((row: any) => camelizeKeys(row) as unknown as Petition);
};

const getPetitionById = async (id: number): Promise<Petition> => {
    const query: string = 'SELECT * FROM petition WHERE id = ?';
    const rows = await getPool().query(query, id);
    return rows[0].length === 0 ? null : camelizeKeys(rows[0][0]) as unknown as Petition;
};

const checkPetitionCategory = async (categoryID: number): Promise<boolean> => {
    const query: string = 'SELECT 1 FROM category WHERE id = ?';
    const rows = await getPool().query(query, categoryID);
    return rows[0].length !== 0;
};

const checkPetitionTitle = async (title: string): Promise<boolean> => {
    const query: string = 'SELECT 1 FROM petition WHERE title = ?';
    const rows = await getPool().query(query, title);
    return rows[0].length === 0;
};

const getSupportTiersByCategory = async (petitionId: number): Promise<SupportTierGet[]> => {
    const query: string = 'SELECT id AS support_tier_id, title, description, cost FROM support_tier WHERE petition_id = ?';
    const rows = await getPool().query(query, petitionId);
    return rows[0].length === 0 ? [] : rows[0].map((row: any) => camelizeKeys(row) as unknown as SupportTierGet);
}

const getSupporterInfo = async (petitionId: number): Promise<SupporterInfo> => {
    const query: string = '' +
        'SELECT COUNT(*) AS supporterCount,' +
        '       SUM(st.cost) AS fundsRaised ' +
        'FROM supporter sp ' +
        'LEFT JOIN' +
        '   support_tier st ON sp.support_tier_id = st.id ' +
        'WHERE sp.petition_id = ?';
    const rows = await getPool().query(query, petitionId);
    return rows.length === null ? null : {supporterCount: Number(rows[0][0].supporterCount), fundsRaised: Number(rows[0][0].fundsRaised)};
};


const getCategories = async (): Promise<Category[]> => {
    const query: string = 'SELECT id AS categoryId, name FROM category';
    const rows = await getPool().query(query);
    return rows[0].length === 0 ? [] : rows[0].map((row: any) => row as unknown as Category);
}

const setFilename = async (id: number, filename: string): Promise<ResultSetHeader> => {
    const query = 'update petition set image_filename = ? where id = ?';
    const [result] = await getPool().query( query, [filename, id]);
    return result;
}

export {insert, update, remove, removeSupportTiers, insertSupportTier, searchPetitions, getPetitionById, checkPetitionCategory, checkPetitionTitle, getSupportTiersByCategory, getSupporterInfo, getCategories, setFilename}