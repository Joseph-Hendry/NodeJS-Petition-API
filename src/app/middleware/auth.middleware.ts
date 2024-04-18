import {NextFunction, Request, Response} from "express";
import * as Users from "../models/user.model";
import Logger from "../../config/logger";
import {validate} from "../services/validator";

const authenticate = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
        // Get the token
        const token = req.header('X-Authorization');

        // Check the user from token
        const user = await Users.getUserByToken(token);

        // Check token and uesr
        if(token == null || user == null) {
            res.statusMessage = 'Unauthorized';
            res.status(401).send();
            return;
        }

        // Set the user id
        req.userId = user.id;

        // Call the next function
        next();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
        return;
    }
}

const optionalAuthenticate = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
        // Get the token
        const token = req.header('X-Authorization');

        // Check the user from token
        const user = await Users.getUserByToken(token);

        // Check token and user
        if(token == null || user == null) {
            req.userId = -1;
        } else {
            req.userId = user.id;
        }

        // Call the next function
        next();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
        return;
    }
}
const validateJSON = (schema: object) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Get the JSON validation
            const validation = await validate(schema, req.body);

            // Check JSON
            if (validation !== true) {
                res.statusMessage = `Bad Request: ${validation.toString()}`;
                res.status(400).send();
                return;
            }

            // Call the next function
            next();

        } catch (err) {
            Logger.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500).send();
            return;
        }
    };
};

export {authenticate, optionalAuthenticate, validateJSON}