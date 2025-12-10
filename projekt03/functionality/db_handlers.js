import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

db.exec(`CREATE TABLE IF NOT EXISTS "Hk_Enemies" (
	"Id"	INTEGER,
	"Name"	TEXT NOT NULL,
	"Enemy_Type"	TEXT DEFAULT 'Normal',
	"Geo_Dropped"	INTEGER NOT NULL,
	"Health"	INTEGER,
	"Damage"	INTEGER NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT)
);` );

export function getAllEnemyData(){
    var Enemy_data = db.prepare("SELECT Id, Name, Enemy_Type, Geo_Dropped, Health, Damage FROM Hk_Enemies;").all();
    return Enemy_data;
}

export function getEnemyData(id){
    var Enemy_data = db.prepare(`SELECT * FROM Hk_Enemies WHERE Id = ?;`).get(id);
    return Enemy_data;
}

export function AddEnemyData(name, enemy_type, geo_dropped, health, damage){
    db.prepare(`INSERT INTO Hk_Enemies(Name, Enemy_Type, Geo_Dropped, Health, Damage) VALUES (?, ?, ?, ?, ?);`).run(name, enemy_type, geo_dropped, health, damage);
}

export function DeleteEnemyData(id){
    db.prepare(`DELETE FROM Hk_Enemies WHERE Id = ?`).run(id);
}

export function ChangeEnemyData(id, name, enemy_type, geo_dropped, health, damage){
    db.prepare(`UPDATE Hk_Enemies SET Name = ?, Enemy_Type = ?, Geo_Dropped = ?, Health = ?, Damage = ? WHERE Id = ?`).run(name, enemy_type, geo_dropped, health, damage, id);
}

export function ValidateInputTypes(name, enemy_type, geo_dropped, health, damage){
    var Errors = [];
    var string_fields = [name, enemy_type];
    var numeric_fields = [Number(geo_dropped), Number(health), Number(damage)];

    for( let data_cell of string_fields ){
        if(!data_cell){ Errors.push("Empty field detected"); continue; }
   
        if(typeof data_cell != "string"){ Errors.push("Unexpected variable type (expected string)"); continue; }
       
        if(data_cell < 1 || data_cell > 500){ Errors.push("Unexpected lenght (should be 1 - 500)"); continue; }
    }

    for( let data_cell of numeric_fields ){
        if(!data_cell){ Errors.push("Empty field detected"); continue; }

        if(typeof data_cell != "number"){ Errors.push("Unexpected variable type (expected number)"); continue; }
       
        let stringified_data_cell = data_cell.toString();

        if( stringified_data_cell < 1 || stringified_data_cell > 500){ Errors.push("Unexpected lenght (should be 1 - 500)"); continue; }

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
    getEnemyData,
    ValidateInputTypes,
    AddEnemyData,
    DeleteEnemyData,
    ChangeEnemyData,
};