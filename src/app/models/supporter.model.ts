import Logger from '../../config/logger';
import {getPool} from "../../config/db";
import {camelizeKeys} from "humps";
import {ResultSetHeader} from "mysql2";
import * as PetitionService from "../services/petition.service";


const insert = async (support: SupportPost, petitionId: number, userId: number): Promise<ResultSetHeader> => {
    const query = 'insert into supporter (petition_id, support_tier_id, user_id, message) values ( ?, ?, ?, ?)';
    const [result] = await getPool().query( query, [petitionId, support.supportTierId, userId, support.message]);
    return result;
}
const getSupport = async (petitionId: number, supportTierId: number, userId: number): Promise<Support> => {
    const query: string = 'SELECT * FROM supporter WHERE petition_id = ? AND support_tier_id = ? AND user_id = ?';
    const rows = await getPool().query(query, [petitionId, supportTierId, userId]);
    return rows[0].length === 0 ? null : camelizeKeys(rows[0][0]) as unknown as Support;
}

const getSupporters = async (id: number): Promise<Supporter[]> => {
    const query = '' +
        'SELECT sp.id AS supportId,' +
        '       sp.support_tier_id,' +
        '       sp.message,' +
        '       u.id AS supporterId,' +
        '       u.first_name AS supporterFirstName,' +
        '       u.last_name AS supporterLastName,' +
        '       sp.timestamp ' +
        'FROM supporter sp ' +
        'INNER JOIN user u ON u.id = sp.user_id ' +
        'WHERE petition_id = ? ' +
        'ORDER BY sp.timestamp DESC';
    const rows = await getPool().query(query, id);
    return rows[0].length === 0 ? [] : rows[0].map((row: any) => camelizeKeys(row) as unknown as Supporter);
};

const checkSupporters = async (tierId: number): Promise<boolean> => {
    const query: string = 'SELECT 1 FROM supporter WHERE support_tier_id = ?';
    const rows = await getPool().query(query, [tierId]);
    return rows[0].length === 0;
};

export {insert, getSupport, getSupporters, checkSupporters}