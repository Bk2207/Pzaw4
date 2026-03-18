import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path, { readBigInts : true});

const SESSION_COOKIE_NAME = "session";
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = ONE_DAY * 7;

db.exec(`CREATE TABLE IF NOT EXISTS "Sessions" (
	"Id" INTEGER,
    "User_id" INTEGER,
    "Created_at" INTEGER
    PRIMARY KEY("Id" AUTOINCREMENT)
) STRICT;` );

function createSession(User, res){
    let Session_id = randomBytes(8).readBigInt64BE();
    let Created_at = Date.now();

    let Session = db.prepare("INSERT INTO Sessions(Id, User_id, Created_at) VALUES(?, ?, ?) RETURNING Id, User_id, Created_at").run(Session_id, User, Created_at);
    res.locals.session = Session;

    res.Cookie(SESSION_COOKIE_NAME, Session.id.toString(), {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: true,
    });
    return Session;
}

function sessionHandler(req, res, next){
    let SessionId = req.cookies[SESSION_COOKIE_NAME];
    let Session = null;
    if(SessionId != null){
        if(!SessionId.match(/^-?[0-9]+$/)){
            SessionId = null;
        } else{
            SessionId = BigInt(SessionId);
        }
    }
}