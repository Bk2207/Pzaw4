import { DatabaseSync } from "node:sqlite";
import { createUser } from "../functionality/user_handler.js";
const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

var Name = ["Crawlid", "TikTik", "Husk Guard", "Void Tendrils", "Dsigraced Chef Lugoli", "Gruz", "Elder Baldur", "Baldur", "Grand Mother Silk", "Moss Knight"];
var Enemy_type = ["Normal", "MiniBoss", "Boss"];

var User_name = ["Cave Johnson", "Master Chief", "Gordon Freeman", "UndefinedUser120", "asdfyuiawDTGW"];

for (let i = 0; i < 15; i++) {
    db.prepare(`INSERT INTO Hk_Enemies(User_Id, Name, Enemy_Type, Geo_Dropped, Health, Damage) VALUES (?, ?, ?, ?, ?, ?);`).run(Math.floor(Math.random() * 4) + 1 , Name[Math.floor(Math.random() * 10)], Enemy_type[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 500), Math.floor(Math.random() * 100), Math.floor(Math.random() * 2));
}

for (let i = 0; i < 5; i++){
    createUser(User_name[i], "123", "123");
}


