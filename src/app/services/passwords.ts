import bcrypt from 'bcryptjs';
import Logger from '../../config/logger';

const hash = async (password: string): Promise<string> => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error('Hashing failed');
    }
}

const compare = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        Logger.error('Error comparing passwords:', error);
        throw new Error('Comparison failed');
    }
}

export {hash, compare}