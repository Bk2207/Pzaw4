import { createUser } from "../functionality/user_handler.js";
import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);
createUser("Admin", "Admin", "Admin");
db.prepare(`UPDATE Users SET Is_admin = ? WHERE Users.User_name = 'Admin'`).run(1);