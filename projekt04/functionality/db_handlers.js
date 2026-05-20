import { DatabaseSync } from "node:sqlite";

const DB_PATH = "./db.sqlite";
const DB = new DatabaseSync(DB_PATH);

createEnemiesTable();

const DB_STATEMENTS = {
    enemies_data: DB.prepare("SELECT Id, User_Id, Name, Enemy_Type, Geo_Dropped, Health, Damage FROM Hk_Enemies;"),
    enemy_data: DB.prepare(`SELECT * FROM Hk_Enemies WHERE Id = ?;`),
    enemy_insert: DB.prepare(`INSERT INTO Hk_Enemies(User_Id, Name, Enemy_Type, Geo_Dropped, Health, Damage) VALUES (?, ?, ?, ?, ?, ?);`),
    enemy_delete: DB.prepare(`DELETE FROM Hk_Enemies WHERE Id = ?`),
    enemy_change: DB.prepare(`UPDATE Hk_Enemies SET Name = ?, Enemy_Type = ?, Geo_Dropped = ?, Health = ?, Damage = ? WHERE Id = ?;`)
};

export function createEnemiesTable(){
    DB.exec(`CREATE TABLE IF NOT EXISTS "Hk_Enemies" (
	"Id"	INTEGER,
    "User_Id" INTEGER,
	"Name"	TEXT NOT NULL,
	"Enemy_Type"	TEXT DEFAULT 'Normal',
	"Geo_Dropped"	INTEGER NOT NULL,
	"Health"	INTEGER,
	"Damage"	INTEGER NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT)
);` );
}

export function getAllEnemyData(){
    return DB_STATEMENTS.enemies_data.all();
}

export function getEnemyDataById(id){
    return DB_STATEMENTS.enemy_data.get(id);
}

export function addEnemyData(name, enemy_type, geo_dropped, health, damage, user){
    let user_id = user.user_id;
    DB_STATEMENTS.enemy_insert.run(user_id, name, enemy_type, geo_dropped, health, damage);
}

export function deleteEnemyData(id, CSRF_Token, user){
    if(CSRF_Token != user.CSRF_Token){
        return;
    }

    DB_STATEMENTS.enemy_delete.run(id);
}

export function changeEnemyData(name, enemy_type, geo_dropped, health, damage, enemy_id){
    DB_STATEMENTS.enemy_change.run(name, enemy_type, geo_dropped, health, damage, enemy_id);
}

export function validateInputTypes(enemy_name, enemy_type, geo_dropped, health, damage, CSRF_Token, user){

    if( (CSRF_Token != user.CSRF_Token) && (user.is_admin) ){
        return false;
    }

    var Errors = [];
    var string_fields = [enemy_name, enemy_type];
    var numeric_fields = [Number(geo_dropped), Number(health), Number(damage)];

    for( let data_cell of string_fields ){
        if(!data_cell){ Errors.push("Empty field detected"); continue; }
   
        if(typeof data_cell != "string"){ Errors.push("Unexpected variable type (expected string)"); continue; }
       
        if(data_cell.length < 1 || data_cell.length > 500){ Errors.push("Unexpected input lenght (should be 1 - 500)"); continue; }
    }

    for( let data_cell of numeric_fields ){
        if(!data_cell && data_cell != 0){ Errors.push("Empty field detected"); continue; }

        if(typeof data_cell != "number"){ Errors.push("Unexpected variable type (expected number)"); continue; }
       
        let stringified_data_cell = data_cell.toString();

        if(stringified_data_cell.length < 1 || stringified_data_cell.length > 500){ Errors.push("Unexpected input lenght (should be 1 - 500)"); continue; }
    }
    
    if(Errors.length > 0){
        return false;
    }
    else if (Errors.length == 0){
        return true;
    }
}

export default{
    getAllEnemyData,
    getEnemyDataById,
    validateInputTypes,
    addEnemyData,
    deleteEnemyData,
    changeEnemyData,
    createEnemiesTable
};