import db_handlers from "../functionality/db_handlers.js";


var Name = ["Crawlid", "TikTik", "Husk Guard", "Void Tendrils", "Dsigraced Chef Lugoli", "Gruz", "Elder Baldur", "Baldur", "Grand Mother Silk", "Moss Knight"];
var Enemy_type = ["Normal", "MiniBoss", "Boss"];

for (let i = 0; i < 15; i++) {
    db_handlers.AddEnemyData(Name[Math.floor(Math.random() * 10)], Enemy_type[Math.floor(Math.random() * 3)], Math.floor(Math.random() * 500), Math.floor(Math.random() * 100), Math.floor(Math.random() * 2));
}


