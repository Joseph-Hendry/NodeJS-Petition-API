import Logger from '../../config/logger';
import {getPool} from "../../config/db";
import {camelizeKeys} from "humps";
import {ResultSetHeader} from "mysql2";

const insert = async (supportTier: SupportTierPost, petitionId: number): Promise<ResultSetHeader> => {
    const query = 'insert into support_tier (petition_id, title, description, cost) values ( ?, ?, ?, ?)';
    const [result] = await getPool().query( query, [petitionId, supportTier.title, supportTier.description, supportTier.cost]);
    return result;
};

const update = async (supportTier: SupportTierPatch, tierId: number): Promise<ResultSetHeader> => {
    const query = 'UPDATE support_tier SET title = ?, description = ?, cost = ? WHERE id = ?';
    const [result] = await getPool().query(query, [supportTier.title, supportTier.description, supportTier.cost, tierId]);
    return result;
};

const remove = async (tierId: number): Promise<ResultSetHeader> => {
    const query = 'DELETE FROM support_tier WHERE id = ?';
    const [result] = await getPool().query(query, [tierId]);
    return result;
};

const getById = async (tierId: number): Promise<SupportTierReturn> => {
    const query = 'SELECT * FROM support_tier WHERE id = ?';
    const rows = await getPool().query(query, [tierId]);
    return rows[0].length === 0 ? null : camelizeKeys(rows[0][0]) as unknown as SupportTierReturn;
};

const getByCategoryId = async (petitionId: number): Promise<SupportTierPost[]> => {
    const query = 'SELECT * FROM support_tier WHERE petition_id = ?';
    const rows = await getPool().query(query, [petitionId]);
    return rows[0].length === 0 ? [] : rows[0].map((row: any) => camelizeKeys(row) as unknown as SupportTierPost);
};

const checkTitle = async (title: string, petitionId: number): Promise<boolean> => {
    const query: string = 'SELECT 1 FROM support_tier WHERE petition_id = ? AND title = ?';
    const rows = await getPool().query(query, [petitionId, title]);
    return rows[0].length === 0;
};

export {insert, update, remove, getById, getByCategoryId, checkTitle}