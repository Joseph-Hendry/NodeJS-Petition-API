import {Express} from "express";
import {rootUrl} from "./base.routes";
import * as user from '../controllers/user.controller';
import * as userImages from '../controllers/user.image.controller';
import * as schemas from '../resources/schemas.json';
import {authenticate, optionalAuthenticate, validateJSON} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl+'/users/register')
        .post(validateJSON(schemas.user_register), user.register);

    app.route(rootUrl+'/users/login')
        .post(validateJSON(schemas.user_login), user.login);

    app.route(rootUrl+'/users/logout')
        .post(authenticate, user.logout);

    app.route(rootUrl+'/users/:id')
        .get(optionalAuthenticate, user.view)
        .patch(authenticate, validateJSON(schemas.user_edit), user.update);

    app.route(rootUrl+'/users/:id/image')
        .get(userImages.getImage)
        .put(authenticate, userImages.setImage)
        .delete(authenticate, userImages.deleteImage)
}