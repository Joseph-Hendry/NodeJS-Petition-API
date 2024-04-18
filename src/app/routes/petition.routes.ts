import {Express} from "express";
import {rootUrl} from "./base.routes";
import * as petition from '../controllers/petition.controller'
import * as petitionImage from '../controllers/petition.image.controller'
import * as supportTiers from "../controllers/petition.support_tier.controller";
import * as supporter from "../controllers/petition.supporter.controller";
import * as schemas from '../resources/schemas.json';
import {authenticate, validateJSON} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl+'/petitions')
        .get(petition.getAllPetitions)
        .post(authenticate, validateJSON(schemas.petition_post), petition.addPetition);

    app.route(rootUrl+'/petitions/categories')
        .get(petition.getCategories);

    app.route(rootUrl+'/petitions/:id')
        .get(petition.getPetition)
        .patch(authenticate, validateJSON(schemas.petition_patch), petition.editPetition)
        .delete(authenticate, petition.deletePetition);

    app.route(rootUrl+'/petitions/:id/image')
        .get(petitionImage.getImage)
        .put(authenticate, petitionImage.setImage);

    app.route(rootUrl+'/petitions/:id/supportTiers')
        .put(authenticate, validateJSON(schemas.support_tier_post), supportTiers.addSupportTier);

    app.route(rootUrl+'/petitions/:id/supportTiers/:tierId')
        .patch(authenticate, validateJSON(schemas.support_tier_patch), supportTiers.editSupportTier)
        .delete(authenticate, supportTiers.deleteSupportTier);

    app.route(rootUrl + '/petitions/:id/supporters')
        .get(supporter.getAllSupportersForPetition)
        .post(authenticate, validateJSON(schemas.support_post), supporter.addSupporter);
}