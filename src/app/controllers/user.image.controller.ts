import {Request, Response} from "express";
import * as Images from '../models/image.model';
import * as Users from '../models/user.model';
import * as ImageValidator from "../services/image.service";
import Logger from "../../config/logger";

const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get filename
        const filename = await Users.getUserFilename(id);

        // Check user
        if (filename == null) {
            res.statusMessage = "Not Found: No user with specified ID, or user has no image";
            res.status(404).send();
            return;
        }

        // Get image
        const image: Image  = await Images.getImage(filename);

        // Return a 200 OK Code with image
        res.status(200).contentType(image.mime).send(image.image);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);
        const image: Image = {image: req.body, mime: req.header('Content-Type')};

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
            res.statusMessage = "Not Found: No such user with ID given";
            res.status(404).send();
            return;
        }

        // Check user id and token
        if (req.userId !== user.id) {
            res.statusMessage = "Forbidden: Can not change another user's profile photo";
            res.status(403).send();
            return;
        }

        // Check image
        if (ImageValidator.getExtension(image.mime) == null) {
            res.statusMessage = "Bad Request: Invalid image supplied (possibly incorrect file type)";
            res.status(400).send();
            return;
        }

        // Check image exists
        let code = 201;
        const oldFilename = await Users.getUserFilename(id);
        if (oldFilename != null) {
            code = 200;
            await Images.delImage(oldFilename)
        }

        // Set filename
        const filename = "user_" + id + ImageValidator.getExtension(image.mime);

        // Set image
        await Images.setImage(image, filename);
        await Users.setUserFilename(id, filename);

        // Return a code (200 or 201)
        res.status(code).send();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteImage = async (req: Request, res: Response): Promise<void> => {
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
        const idUser: User = await Users.getUserById(id);

        // Check user
        if (idUser === null) {
            res.statusMessage = "Not Found: No such user with ID given";
            res.status(404).send();
            return;
        }

        // Check user id and token
        if (req.userId !== idUser.id) {
            res.statusMessage = "Forbidden: Can not delete another user's profile photo";
            res.status(403).send();
            return;
        }

        // Check image exists
        const filename = await Users.getUserFilename(id);
        if (filename == null) {
            res.statusMessage = "Not Found: No such user with ID given";
            res.status(404).send();
            return;
        }

        // Delete image
        await Images.delImage(filename);
        await Users.setUserFilename(id, null);

        // Return a 200 OK Code
        res.status(200).send();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}