import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";

import { createSession } from "./session_handler.js";
import { getSessionInfoById } from "./session_handler.js";


const PEPPER = process.env.PEPPER;
if(PEPPER == null){
    console.error("PEPPER env variable missing");
    process.exit(1);
}

const HASH_PARAM = { 
  secret:  Buffer.from(PEPPER, "hex"),
  algorithm: "argon2id",
};

const DB_PATH = "./db.sqlite";
const DB = new DatabaseSync(DB_PATH);

createUsersTable();

const USER_STATEMENTS = {
    find_user_by_username: DB.prepare("SELECT * FROM 'Users' WHERE Users.User_name = ?;"),
    find_user_by_id: DB.prepare("SELECT * FROM 'Users' WHERE Users.Id = ?;"),
    create_user: DB.prepare("INSERT INTO Users(Is_admin, User_name, Pass_hash, Created_at) VALUES (?, ?, ?, ?);")
};

export function createUsersTable(){
    DB.exec(`CREATE TABLE IF NOT EXISTS "Users" (
	"Id"	INTEGER,
    "Is_admin" INTEGER,
    "User_name" TEXT UNIQUE,
    "Pass_hash" TEXT,
    "Created_at" DATE,
	PRIMARY KEY("Id" AUTOINCREMENT)
    );`);
}

export function findUserByUsername(username){
    return USER_STATEMENTS.find_user_by_username.get(username);
}

export function findUserById(id){
    return USER_STATEMENTS.find_user_by_id.get(id);
}

export async function createUser(username, password, password_repeat, is_admin = 0){
    if(findUserByUsername(username) != null){
        return new Array(false, "Given username already exists");
    }
    
    if(password != password_repeat){
        return new Array(false, "Repeated passwords are different");
    }

    if(String(username).length < 3 || String(username).length > 200){
        return new Array(false, "Given username isnt in the allowd length brackets (3 - 200) ");
    }

    let Created_at = Date.now();
    let Pass_hash = await argon2.hash(password, HASH_PARAM);
    USER_STATEMENTS.create_user.run(is_admin, username, Pass_hash, Created_at);

    return new Array(true, "Account sucesfully created");
}

export async function validatePassword(username, password){
    let auth_data = findUserByUsername(username);

    if(auth_data == null){
        return new Array(false, "Given username doesn't exist");
    }

    auth_data = Object.values(auth_data);

    if(await argon2.verify(auth_data[3], password, HASH_PARAM)){
        return new Array(true, auth_data[0]);
    }
    else{
        return new Array(false, "Given password is incorrect");
    }
}

export async function loginUser(login, password, res, req){
    let validation_data = await validatePassword(login, password);
    if(validation_data[0]){
        if(createSession(res, req, validation_data[1])){
            res.redirect("/");
        }
        else{
            res.status(409);
            res.render("error", { 
                title : "error 409",
                desc : "Multiple sessions were attempted to be launched from the same account"
        });
        }
    }
    else{
        res.render("sign_in", {
            title: "Account log in",
            creation_msg : validation_data[1],
            is_cookie : !isNaN(req.cookies['session']),
            user_name: res?.locals.username,
        });
        return;
    }
}

export async function accountCreationHandler(req, res, SESSION_COOKIE_NAME){
    const USER_INFO = {
        username: req.body.username,
        password: req.body.password,
        password_repeat: req.body.password_repeat
    }

    const ACCOUNT_CREATION_INFO = await createUser(USER_INFO.username, USER_INFO.password, USER_INFO.password_repeat);

    if(ACCOUNT_CREATION_INFO[0]){
        loginUser(USER_INFO.username, USER_INFO.password, res, req);
    }
    else{
        res.render("sign_up", {
            title: "Account sign up",
            creation_msg: ACCOUNT_CREATION_INFO[1],
            is_cookie : !isNaN(req.cookies[SESSION_COOKIE_NAME]),
            user_name: res.locals.username,
        });
    }
}

export function assignUserDataToSession(req, SESSION_COOKIE_NAME){
    const SESSION_INFO = Object.values(getSessionInfoById(req.cookies[SESSION_COOKIE_NAME]));
    const USER_INFO = Object.values(findUserById(Number(SESSION_INFO[1])));

    let USER_OBJ = {
        user_id: Number(SESSION_INFO[1]),
        is_admin: (Number(USER_INFO[1]) == 1) ? true : false,
        username: String(USER_INFO[2]),
        CSRF_Token: String(SESSION_INFO[3])
    }

    console.log(USER_OBJ.is_admin);

    return USER_OBJ;
}

export default{
    createUser,
    validatePassword,
    findUserById,
    findUserByUsername,
    loginUser,
    createUsersTable
}