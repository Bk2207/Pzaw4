import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path, { readBigInts : true});

const SESSION_COOKIE_NAME = "session";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = ONE_DAY * 7;

db.exec(`CREATE TABLE IF NOT EXISTS "Sessions" (
	"Id" INTEGER PRIMARY KEY,
    "User_id" INTEGER,
    "Created_at" DATE,
    "CSRF_Token" TEXT
);`);

export function createSession(res, User_id){
    let Session_id = randomBytes(8).readBigInt64BE();
    let CSRF_Token = randomBytes(24).toString("base64");
    let Created_at = Date.now();

    db.prepare("INSERT INTO Sessions(Id, User_id, Created_at, CSRF_Token) VALUES(?, ?, ?, ?)").run(Session_id, User_id, Created_at, CSRF_Token);

    res.cookie(SESSION_COOKIE_NAME, Session_id, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: true
    });

    return true;
}

export function deleteSession(Session_id){
    db.prepare("DELETE FROM Sessions WHERE Sessions.Id = ?;").run(Session_id);
}

export function getSessionInfoById(Session_id){
    return db.prepare("SELECT * FROM Sessions WHERE Sessions.Id = ?;").get(Session_id);
}

export default{
    createSession,
    deleteSession,
    getSessionInfoById,
}