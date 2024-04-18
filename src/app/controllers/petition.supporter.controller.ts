import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as Petitions from '../models/petition.model';
import * as Supporter from '../models/supporter.model';
import * as Users from '../models/user.model';
import {validate} from "../services/validator";
import * as schemas from "../resources/schemas.json";

const getAllSupportersForPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        // Get the id
        const id = parseInt(req.params.id, 10)

        // Check the id
        if (isNaN(id)) {
            res.statusMessage = "Not Found: No petition with id";
            res.status(404).send();
            return;
        }

        // Get the supporters
        const supporters: Supporter[] = await Supporter.getSupporters(id);
        if (supporters.length === 0) {
            res.statusMessage = "Not Found: No petition with id";
            res.status(404).send();
            return;
        }

        // Return a 200 OK Code
        res.status(200).send(supporters);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addSupporter = async (req: Request, res: Response): Promise<void> => {
    try{
        // Get the petition and support tier id
        const petitionId = parseInt(req.params.id, 10);

        // Get the body
        const supportPost = req.body as unknown as SupportPost;

        // Check the ids
        if (isNaN(petitionId) || petitionId < 0) {
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        // Get the petition
        const petition: Petition = await Petitions.getPetitionById(petitionId);

        // Check the petition
        if (petition == null) {
            res.statusMessage = `No petition found with id`;
            res.status(404).send();
            return;
        }

        // Get support
        const support: Support = await Supporter.getSupport(petitionId, supportPost.supportTierId, req.userId);

        // Check the support new
        if (support != null) {
            res.statusMessage = `Already supported at this tier`;
            res.status(403).send();
            return;
        }

        // Check not users petition
        if (req.userId === petition.ownerId) {
            res.statusMessage = `Cannot support your own petition`;
            res.status(403).send();
            return;
        }

        // Add the support to the database
        await Supporter.insert(supportPost, petitionId, req.userId);

        // Return a 201 Created Code
        res.status(201).send();
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getAllSupportersForPetition, addSupporter}