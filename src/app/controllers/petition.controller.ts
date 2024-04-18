import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Petitions from '../models/petition.model';
import * as PetitionsService from '../services/petition.service';
import {validate} from "../services/validator";
import * as schemas from "../resources/schemas.json";

const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get user JSON
        const search = req.query as PetitionSearch

        // Validate registration JSON
        const validation = await validate(schemas.petition_search, search);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }

        // Check the categories
        if (search.categoryIds != null) {
            search.categoryIds = Array.isArray(search.categoryIds) ? search.categoryIds : [search.categoryIds];
            for (const categoryId of search.categoryIds) {
                const id = parseInt(categoryId, 10)
                if (!await Petitions.checkPetitionCategory(id)) {
                    res.statusMessage = `Bad Request: Category doesn't exist`;
                    res.status(400).send();
                    return;
                }
            }
        }

        // Get the petitions
        const petitions = await Petitions.searchPetitions(search);

        // Slice petitions
        const petitionReturn: PetitionReturn = await PetitionsService.getPetitionQuery(search, petitions);

        // Return a 200 OK Code
        res.status(200).send(petitionReturn);
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Bad Request: Invalid ID";
            res.status(400).send();
            return;
        }

        // Get and check petition by id
        const petition: Petition = await Petitions.getPetitionById(id);
        if (petition == null) {
            res.statusMessage = "Not Fount: No petition with id";
            res.status(404).send();
            return;
        }

        // Get the petition in get format
        const petitionGet: PetitionGet = await PetitionsService.getPetitionGet(petition);

        // Return a 200 OK Code
        res.status(200).send(petitionGet);
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        // Get user JSON
        const add = req.body as unknown as PetitionAdd;

        // Check category id exists
        if (!await Petitions.checkPetitionCategory(add.categoryId)) {
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        // Check petition title unique
        if (!await Petitions.checkPetitionTitle(add.title)) {
            res.statusMessage = `Forbidden: Petition title already exists`;
            res.status(403).send();
            return;
        }

        // Check each support tier title unique with each-other
        if (add.supportTiers.length !== (new Set(add.supportTiers)).size) {
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        // Create the petition
        const petition: PetitionPost = {
            title: add.title,
            description: add.description,
            creationDate: new Date(),
            ownerId: req.userId,
            categoryId: 2
        };

        // Add the user to the database
        const result = await Petitions.insert(petition);

        // Insert the support tiers
        for (const supportTier of add.supportTiers) {
            await Petitions.insertSupportTier(supportTier, result.insertId);
        }

        // Return a 201 Created Code
        res.status(201).send({ "petitionId": result.insertId });
        return;

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Get user JSON
        const edit = req.body as unknown as PetitionPost;

        // Check category id exists
        if (edit.categoryId != null && !await Petitions.checkPetitionCategory(edit.categoryId)) {
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        // Check petition title unique
        if (edit.title != null && !await Petitions.checkPetitionTitle(edit.title)) {
            res.statusMessage = `Forbidden: Petition title already exists`;
            res.status(403).send();
            return;
        }

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Bad Request: Invalid information";
            res.status(400).send();
            return;
        }

        // Get user by id
        const idPetition: Petition = await Petitions.getPetitionById(id);

        // Check id user
        if (idPetition == null) {
            res.statusMessage = "Not Found: No petition found with id";
            res.status(404).send();
            return;
        }

        // Check user id and token
        if (req.userId !== idPetition.ownerId) {
            res.statusMessage = "Forbidden: Only the owner of a petition may change it";
            res.status(403).send();
            return;
        }

        // Update the petition
        if (edit.title == null) {edit.title = idPetition.title;}
        if (edit.description == null) {edit.description = idPetition.description;}
        if (edit.categoryId == null) {edit.categoryId = idPetition.categoryId;}
        await Petitions.update(edit, idPetition.id);

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

const deletePetition = async (req: Request, res: Response): Promise<void> => {
    try{
        // Set the variables
        const id = parseInt(req.params.id, 10);

        // Check id
        if (isNaN(id) || id < 0) {
            res.statusMessage = "Not Found: No petition found with id";
            res.status(404).send();
            return;
        }

        // Get user by id
        const idPetition: Petition = await Petitions.getPetitionById(id);

        // Check id user
        if (idPetition == null) {
            res.statusMessage = "Not Found: No petition found with id";
            res.status(404).send();
            return;
        }

        // Check user id and token
        if (req.userId !== idPetition.ownerId) {
            res.statusMessage = "Forbidden: Only the owner of a petition may delete it";
            res.status(403).send();
            return;
        }

        // Check if a petition can be deleted
        const supporterInfo= await Petitions.getSupporterInfo(idPetition.id);
        if (supporterInfo.supporterCount !== 0) {
            res.statusMessage = "Forbidden: Can not delete a petition with one or more supporters";
            res.status(403).send();
            return;
        }

        // Delete petition and its supporters
        await Petitions.removeSupportTiers(idPetition.id);
        await Petitions.remove(idPetition.id);

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

const getCategories = async(req: Request, res: Response): Promise<void> => {
    try{
        // Get categories
        const categories: Category[] = await Petitions.getCategories();

        // Return a 200 OK Code
        res.status(200).send(categories);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getAllPetitions, getPetition, addPetition, editPetition, deletePetition, getCategories};