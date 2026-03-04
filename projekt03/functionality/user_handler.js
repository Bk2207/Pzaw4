import { DataBaseSync } from "node:sqlite";
import argon2 from "node:crypto";

const PEPPER = process.env.PEPPER;
if(PEPPER = null){
    console.error("PEPPER env variable missing");
    process.exit(1);
}

const HASH_PARAM = Buffer.from(PEPPER, "hex")


const db_path = "./db.sqlite";
const db = new DataBaseSync(db_path);

db.exec(`CREATE TABLE IF NOT EXISTS "Users" (
	"Id"	INTEGER,
    "User_name" TEXT UNIQUE,
    "Pass_hash" TEXT,
    "Created_at" DATE,
	PRIMARY KEY("Id" AUTOINCREMENT)
);` );

function find_user_by_username(username){
    return db.prepare("SELECT * FROM 'Users' WHERE Users.User_name = ?;").run(username);
}

export function find_user_by_id(id){
    return db.prepare("SELECT * FROM 'Users' WHERE Users.Id = ?").run(id);
}

export async function createUser(username, password){
    if(find_user_by_username(username) != null){
        return "Username already taken";
    }

    let Created_at = Date.now();
    let Pass_hash = await argon2.hash(password, HASH_PARAM);

    let User_data = db.prepare("INSERT INTO Users(User_name, Pass_hash, Created_at) VALUES (?, ?, ?)").run(username, Pass_hash, Created_at);
}

export async function validatePassword(username, password){
    let auth_data = db.prepare("SELECT Id, Pass_hash FROM Users WHERE User_name = ?").run(username);

    if(auth_data == null){
        return "Unabel to find user";
    }

    if(await argon2.verify(auth_data.Pass_hash, password, HASH_PARAM)){
        return auth_data.Id;
    }
}

export default{
    createUser,
    validatePassword,
    find_user_by_id,
}