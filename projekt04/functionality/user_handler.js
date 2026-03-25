import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";
import { createSession } from "./session_handler.js";

const PEPPER = process.env.PEPPER;
if(PEPPER == null){
    console.error("PEPPER env variable missing");
    process.exit(1);
}

const HASH_PARAM = { 
  secret:  Buffer.from(PEPPER, "hex"),
  algorithm: "argon2id",
};
const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

db.exec(`CREATE TABLE IF NOT EXISTS "Users" (
	"Id"	INTEGER,
    "Is_admin" INTEGER,
    "User_name" TEXT UNIQUE,
    "Pass_hash" TEXT,
    "Created_at" DATE,
	PRIMARY KEY("Id" AUTOINCREMENT)
);`);

export function find_user_by_username(username){
    return db.prepare("SELECT * FROM 'Users' WHERE Users.User_name = ?;").get(username);
}

export function find_user_by_id(id){
    return db.prepare("SELECT * FROM 'Users' WHERE Users.Id = ?;").get(id);
}

export async function createUser(username, password, password_repeat){
    if(password != password_repeat){
        return false;
    }
    if(find_user_by_username(username) != null){
        return false;
    }
    let Created_at = Date.now();
    let Pass_hash = await argon2.hash(password, HASH_PARAM);
    db.prepare("INSERT INTO Users(Is_admin, User_name, Pass_hash, Created_at) VALUES (?, ?, ?, ?);").run(0, username, Pass_hash, Created_at);
    return true;
}

export async function validatePassword(username, password){
    let auth_data = find_user_by_username(username);

    if(auth_data == null){
        return false;
    }

    auth_data = Object.values(auth_data);

    if(await argon2.verify(auth_data[3], password, HASH_PARAM)){
        return auth_data[0];
    }
}

export async function LoginUser(req, res){
    let user_id = await validatePassword(req.body.login, req.body.password);
    if(user_id != false){
        createSession(res, user_id);
        res.redirect("/");
    }
    else{
        res.redirect("/");
        return;
    }
}

export default{
    createUser,
    validatePassword,
    find_user_by_id,
    find_user_by_username,
    LoginUser,
}