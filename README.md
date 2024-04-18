# Node.js API Server (Petition Site)

## Description
A node.js API server made for users to be able to create petitions.

Features:
* Users are authenticated using session cookies
* Data is persistent and stored in a MySQL database (accessed through .env)
* Includes extensive API postman tests
* Include various security features to ensure users permissions are as specified in API specifications
* Users can upload photos to their profile and petitions

## Running locally

1. Use `npm install` to populate the `node_modules/` directory with up-to-date packages
2. Create a file called `.env`, following the instructions in the section below
3. Go to https://dbadmin.csse.canterbury.ac.nz and create a database with the name that you set in the `.env` file (UC students only)
2. Run `npm run start` or `npm run debug` to start the server
3. The server will be accessible on `localhost:4941`

### `.env` file

Create a `.env` file in the root directory of this project including the following information (note that you will need
to create the database first in phpMyAdmin):

```
SENG365_MYSQL_HOST=db2.csse.canterbury.ac.nz
SENG365_MYSQL_USER={your usercode}
SENG365_MYSQL_PASSWORD={your password}
SENG365_MYSQL_DATABASE={a database starting with your usercode then an underscore}
```