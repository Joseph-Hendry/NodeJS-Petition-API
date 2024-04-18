type User = {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    imageFilename: string,
    authToken: string
}

type UserRegister = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}

type UserLogin = {
    email: string,
    password: string
}

type UserAuthed = {
    firstName: string,
    lastName: string,
    email:string
}

type UserUnAuthed = {
    firstName: string,
    lastName: string
}

type UserUpdate = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    currentPassword: string
}