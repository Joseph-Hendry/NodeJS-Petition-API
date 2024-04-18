import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as Petitions from '../models/petition.model';
import * as Users from '../models/user.model';
import * as Images from '../models/image.model';
import * as ImageValidator from "../services/image.service";

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

        // Get the petition
        const petition = await Petitions.getPetitionById(id);

        // Check petition
        if (petition == null) {
            res.statusMessage = "Not Found: No petition with id";
            res.status(404).send();
            return;
        }

        // Get the filename
        const filename = petition.imageFilename;

        // Check filename
        if (filename == null) {
            res.statusMessage = "Not Found: Petition has no image";
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
        const petitionId = parseInt(req.params.id, 10);
        const image: Image = {image: req.body, mime: req.header('Content-Type')};

        // Check id
        if (isNaN(petitionId) || petitionId < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get petition by id
        const petition: Petition = await Petitions.getPetitionById(petitionId);

        // Check petition
        if (petition === null) {
            res.statusMessage = "Not Found: No petition found with id";
            res.status(404).send();
            return;
        }

        // Check petition and token
        if (req.userId !== petition.ownerId) {
            res.statusMessage = "Forbidden: Only the owner of a petition can change the hero image";
            res.status(403).send();
            return;
        }

        // Check image
        if (ImageValidator.getExtension(image.mime) == null) {
            res.statusMessage = "Bad Request: Invalid image supplied";
            res.status(400).send();
            return;
        }

        // Check image exists
        let code = 201;
        if (petition.imageFilename != null) {
            code = 200;
            await Images.delImage(petition.imageFilename)
        }

        // Set filename
        const filename = "petition_" + petitionId + ImageValidator.getExtension(image.mime);

        // Set image
        await Images.setImage(image, filename);
        await Petitions.setFilename(petitionId, filename);

        // Return a code (200 or 201)
        res.status(code).send();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage};