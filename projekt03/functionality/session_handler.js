import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path, { readBigInts : true});

db.exec(`CREATE TABLE IF NOT EXISTS "sessions" (
	"Id" INTEGER,

    PRIMARY KEY("Id" AUTOINCREMENT)
);` );