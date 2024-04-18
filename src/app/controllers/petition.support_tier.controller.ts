import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as Petitions from '../models/petition.model';
import * as Users from '../models/user.model';
import * as SupportTier from '../models/support_tier.model';
import * as Supporter from '../models/supporter.model';
import {validate} from "../services/validator";
import * as schemas from "../resources/schemas.json";

const addSupportTier = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Get user JSON
        const supportTier = req.body as unknown as SupportTierPost;

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get and check id and token
        const petition: Petition = await Petitions.getPetitionById(id);
        if (petition == null) {
            res.statusMessage = "Not Found";
            res.status(404).send();
            return;
        }

        // Check if user different
        if (req.userId !== petition.ownerId) {
            res.statusMessage = "Forbidden: Only the owner of a petition may modify it";
            res.status(403).send();
            return;
        }

        // Check num tiers and titles valid
        const otherSupportTiers = await SupportTier.getByCategoryId(id);
        if (otherSupportTiers.length > 2) {
            res.statusMessage = "Forbidden: Can't add a support tier if 3 already exist";
            res.status(403).send();
            return;
        } else if (otherSupportTiers.some(supportTiers => supportTiers.title === supportTier.title)) {
            res.statusMessage = "Forbidden: Support title not unique within petition";
            res.status(403).send();
            return;
        }

        // Add the support tier
        await SupportTier.insert(supportTier, id);

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

const editSupportTier = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);
        const tierId = parseInt(req.params.tierId, 10);

        // Get user JSON
        const supportTierPatch = req.body as unknown as SupportTierPatch;

        // Check id
        if (isNaN(id) || id < 0 || isNaN(tierId) || tierId < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get and check id and token
        const petition: Petition = await Petitions.getPetitionById(id);
        const supportTier: SupportTierReturn = await SupportTier.getById(tierId);
        if (petition == null || supportTier == null) {
            res.statusMessage = "Not Found";
            res.status(404).send();
            return;
        }

        if (req.userId !== petition.ownerId || petition.id !== supportTier.petitionId) {
            res.statusMessage = "Forbidden: Only the owner of a petition may modify it";
            res.status(403).send();
            return;
        }

        // Check title
        if (supportTierPatch.title != null && !await SupportTier.checkTitle(supportTierPatch.title, id)) {
            res.statusMessage = "Forbidden: Support title not unique within petition";
            res.status(403).send();
            return;
        }

        // Check the supporters
        if (!await Supporter.checkSupporters(tierId)) {
            res.statusMessage = "Forbidden: Can not edit a support tier if a supporter already exists for it";
            res.status(403).send();
            return;
        }

        // Make the variable
        if (supportTierPatch.title == null) {supportTierPatch.title = supportTier.title;}
        if (supportTierPatch.description == null) {supportTierPatch.description = supportTier.description}
        if (supportTierPatch.cost == null) {supportTierPatch.cost = supportTier.cost}

        // Add the support tier
        await SupportTier.update(supportTierPatch, tierId);

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

const deleteSupportTier = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);
        const tierId = parseInt(req.params.tierId, 10);

        // Get user JSON
        const supportTierPatch = req.body as unknown as SupportTierPatch;

        // Validate registration JSON
        const validation = await validate(schemas.support_tier_patch, supportTierPatch);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }

        // Check id
        if (isNaN(id) || id < 0 || isNaN(tierId) || tierId < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get and check id and token
        const petition: Petition = await Petitions.getPetitionById(id);
        const supportTier: SupportTierReturn = await SupportTier.getById(tierId);
        if (petition == null || supportTier == null) {
            res.statusMessage = "Not Found";
            res.status(404).send();
            return;
        }

        if (req.userId !== petition.ownerId || petition.id !== supportTier.petitionId) {
            res.statusMessage = "Forbidden: Only the owner of a petition may delete it";
            res.status(403).send();
            return;
        }

        // Check title
        await SupportTier.getByCategoryId(id);
        if (supportTierPatch.title != null && !await SupportTier.checkTitle(supportTierPatch.title, id)) {
            res.statusMessage = "Forbidden: Can not remove a support tier if it is the only one for a petition";
            res.status(403).send();
            return;
        }

        // Check the supporters
        if (!await Supporter.checkSupporters(tierId)) {
            res.statusMessage = "Forbidden: Can not delete a support tier if a supporter already exists for it";
            res.status(403).send();
            return;
        }

        // Add the support tier
        await SupportTier.remove(tierId);

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

export {addSupportTier, editSupportTier, deleteSupportTier};