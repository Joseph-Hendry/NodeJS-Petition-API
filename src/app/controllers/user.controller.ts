import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Users from '../models/user.model';
import * as passwords from '../services/passwords';
import randtoken from 'rand-token';

import {validate} from "../services/validator";
import * as schemas from '../resources/schemas.json';

const register = async (req: Request, res: Response): Promise<void> => {
    try{
        // Get user JSON
        const userRegister = req.body as UserRegister;

        // Check if the email is in use
        const userWithEmail = await Users.getUserByEmail(userRegister.email);
        if (userWithEmail !== null) {
            res.statusMessage = `Forbidden: Email already in use`;
            res.status(403).send();
            return;
        }

        // Hash the password
        userRegister.password = await passwords.hash(userRegister.password);

        // Add the user to the database
        const result = await Users.insert(userRegister);

        // Return a 201 Created Code
        res.status(201).send({ "userId": result.insertId });
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user JSON
        const userLogin = req.body as UserLogin;

        // Check email and password
        const user = await Users.getUserByEmail(userLogin.email)
        if (user == null || !(await passwords.compare(userLogin.password, user.password))) {
            res.statusMessage = `UnAuthorized: Incorrect email/password`;
            res.status(401).send();
            return;
        }

        // Generate and add token
        const token = randtoken.generate(32);
        await Users.setUserToken(user.id, token);

        // Return a 200 OK Code
        res.status(200).send({"userId": user.id, "token": token});
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const logout = async (req: Request, res: Response): Promise<void> => {
    try{
        // Clear the users token
        await Users.setUserToken(req.userId, null);

        // Return a 200 OK Code
        res.status(200).send();
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get user by id
        const user: User = await Users.getUserById(id);

        // Check user
        if (user == null) {
            res.statusMessage = "Not Found: No user with specified ID";
            res.status(404).send();
            return;
        }

        // If no match send unauthorized user
        if (req.userId !== user.id) {
            const userUnAuthed: UserUnAuthed = {firstName: user.firstName, lastName: user.lastName};
            res.status(200).send(userUnAuthed);
            return;

        // If match send authorized user
        } else {
            const userAuthed: UserAuthed = {firstName: user.firstName, lastName: user.lastName, email: user.email};
            res.status(200).send(userAuthed);
            return;
        }

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const update = async (req: Request, res: Response): Promise<void> => {
    try{
        // Get user JSON
        const userUpdate = req.body as UserUpdate;

        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get user by id
        const idUser: User = await Users.getUserById(id);

        // Check id user
        if (idUser == null) {
            res.statusMessage = "Not Found: No user with specified ID";
            res.status(404).send();
            return;
        }

        // Check user id and token
        if (req.userId !== idUser.id) {
            res.statusMessage = "Forbidden: Can not edit another user's information";
            res.status(403).send();
            return;
        }

        // Check email
        if (await Users.getUserByEmail(userUpdate.email) !== null) {
            res.statusMessage = "Forbidden: Email is already in use";
            res.status(403).send();
            return;
        }

        // Check passwords valid
        if ((userUpdate.password != null && userUpdate.currentPassword == null) || (userUpdate.password == null && userUpdate.currentPassword != null)) {
            res.statusMessage = "Bad request: Invalid information";
            res.status(400).send();
            return;
        }

        // Check passwords dont match valid
        if (userUpdate.currentPassword != null && userUpdate.currentPassword === userUpdate.password) {
            res.statusMessage = "Forbidden: Identical current and new passwords";
            res.status(403).send();
            return;
        }

        // Check password matches
        if (userUpdate.currentPassword != null && !await passwords.compare(userUpdate.currentPassword, idUser.password)) {
            res.statusMessage = "Unauthorized: Invalid currentPassword";
            res.status(401).send();
            return;
        }

        // Set user to update
        if (userUpdate.email != null) {idUser.email = userUpdate.email;}
        if (userUpdate.firstName != null) {idUser.firstName = userUpdate.firstName;}
        if (userUpdate.lastName != null) {idUser.lastName = userUpdate.lastName;}
        if (userUpdate.password != null) {idUser.password = await passwords.hash(userUpdate.password);}

        // Update the user
        await Users.update(idUser);

        // Return a 200 OK Code
        res.status(200).send();
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}