import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";

const DB_PATH = "./db.sqlite";
const DB = new DatabaseSync(DB_PATH, { readBigInts : true});

export const SESSION_COOKIE_NAME = "user_session";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = ONE_DAY * 7;

DB.exec(`CREATE TABLE IF NOT EXISTS "Sessions" (
"Id" INTEGER PRIMARY KEY,
"User_id" INTEGER,
"Created_at" DATE,
"CSRF_Token" TEXT
);`);

const SESSION_STATEMENTS = {
    session_insert: DB.prepare("INSERT INTO Sessions(Id, User_id, Created_at, CSRF_Token) VALUES(?, ?, ?, ?)"),
    session_delete: DB.prepare("DELETE FROM Sessions WHERE Sessions.Id = ?;"),
    session_info: DB.prepare("SELECT * FROM Sessions WHERE Sessions.Id = ?;")
};

export function createSession(res, req, user_id){

    if(!isNaN(req.cookies[SESSION_COOKIE_NAME])){
        return false;
    }

    let session_id = randomBytes(8).readBigInt64BE();
    let CSRF_Token = randomBytes(24).toString("base64");
    let created_at = Date.now();

    SESSION_STATEMENTS.session_insert.run(session_id, user_id, created_at, CSRF_Token);

    res.cookie(SESSION_COOKIE_NAME, session_id, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: true
    });

    return true;
}

export function deleteSession(session_id){
    SESSION_STATEMENTS.session_delete.run(session_id);
}

export function getSessionInfoById(session_id){
    return SESSION_STATEMENTS.session_info.get(session_id);
}

export default{
    createSession,
    deleteSession,
    getSessionInfoById,
    SESSION_COOKIE_NAME
}