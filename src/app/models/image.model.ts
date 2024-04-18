import {fs} from "mz";
import * as ImageValidator from "../services/image.service";
import {ResultSetHeader} from "mysql2";

const filepath = './storage/images/';

const getImage = async (fileName: string): Promise<Image> => {
    return {image: await fs.readFile(filepath + fileName), mime: ImageValidator.getMime(fileName)};
}

const setImage = async (image: Image, filename: string): Promise<void> => {
    await fs.writeFile(filepath + filename, image.image);
}

const delImage = async (filename: string): Promise<void> => {
    await fs.unlink(filepath + filename);
}

export {getImage, setImage, delImage}