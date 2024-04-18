import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';
import {camelizeKeys} from 'humps';

const insert = async (userData: any): Promise<ResultSetHeader> => {
    const query = 'insert into user (email, first_name, last_name, password) values ( ?, ?, ?, ? )';
    const [result] = await getPool().query( query, [userData.email, userData.firstName, userData.lastName, userData.password]);
    return result;
};

const update = async (user: User): Promise<ResultSetHeader> => {
    const query = "UPDATE user SET first_name = ?, last_name = ?, email =?, password=? WHERE id = ?"
    const [result] = await getPool().query(query,[user.firstName, user.lastName, user.email, user.password, user.id]);
    return result
}

const getUserById = async (id: number): Promise<User> => {
    const query = 'select * from user where id = ?';
    const rows = await getPool().query( query, [id]);
    return rows[0].length === 0 ? null : camelizeKeys(rows[0][0]) as unknown as User;
};

const getUserByEmail = async (email: string): Promise<User> => {
    const query = 'select * from user where email = ?';
    const rows = await getPool().query( query, [email]);
    return rows[0].length === 0 ? null : camelizeKeys(rows[0][0]) as unknown as User;
}

const getUserByToken = async (token: string): Promise<User> => {
    const query = 'select * from user where auth_token = ?';
    const rows = await getPool().query( query, [token]);
    return rows[0].length === 0 ? null : camelizeKeys(rows[0][0]) as unknown as User;
}

const getUserFilename = async (id: number): Promise<string> => {
    const query = 'select image_filename from user where id = ?';
    const rows = await getPool().query( query, [id]);
    return rows[0].length === 0 ? null : rows[0][0].image_filename;
}

const setUserFilename = async (id: number, filename: string): Promise<string> => {
    const query = 'update user set image_filename = ? where id = ?';
    const [result] = await getPool().query( query, [filename, id]);
    return result;
}

const setUserToken = async (id: number, token: string): Promise<ResultSetHeader> => {
    const query = 'update user set auth_token = ? where id = ?';
    const [result] = await getPool().query( query, [token, id]);
    return result;
}

export { insert, update, getUserById, getUserByEmail, getUserByToken, getUserFilename, setUserFilename, setUserToken };