import { DatabaseSync } from "node:sqlite";

import { createUser, createUsersTable } from "../functionality/user_handler.js";
import { createEnemiesTable } from "../functionality/db_handlers.js";

const DB_PATH = "./db.sqlite";
const DB = new DatabaseSync(DB_PATH);

createEnemiesTable();
createUsersTable();
//if this goes to shit change lets to vars and suck it up
let Name = ["Crawlid", "TikTik", "Husk Guard", "Void Tendrils", "Dsigraced Chef Lugoli", "Gruz", "Elder Baldur", "Baldur", "Grand Mother Silk", "Moss Knight"];
let Enemy_type = ["Normal", "MiniBoss", "Boss"];

let User_name = ["Cave Johnson", "Master Chief", "Gordon Freeman", "UndefinedUser120", "asdfyuiawDTGW"];

for (let i = 0; i < 15; i++) {
    DB.prepare(`INSERT INTO Hk_Enemies(User_Id, Name, Enemy_Type, Geo_Dropped, Health, Damage) VALUES (?, ?, ?, ?, ?, ?);`).run(Math.floor(Math.random() * 4) + 1 , Name[Math.floor(Math.random() * 10)], Enemy_type[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 500), Math.floor(Math.random() * 100), Math.floor(Math.random() * 2));
}

for (let i = 0; i < 5; i++){
    createUser(User_name[i], "123", "123");
}

createUser("Admin", "Admin", "Admin");
DB.prepare(`UPDATE Users SET Is_admin = ? WHERE Users.User_name = 'Admin'`).run(1);