import express from "express";
import { getAllEnemyData, getEnemyData, ValidateInputTypes ,AddEnemyData, DeleteEnemyData, ChangeEnemyData } from "./functionality/db_handlers.js";

const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded())

var help_variable;


app.get("/", (req, res) =>{
    res.render("enemies",
    {title : "Hunters Journal",
    enemies : getAllEnemyData()});
});

app.get("/dbms", (req, res) =>{
    res.render("dbms",
    {title : "Data Base Managment System",
    enemies : getAllEnemyData()});
});

app.post("/dbms/pre_change", (req, res)=>{
    res.render("change_menu",
        {enemy : getEnemyData(req.body.Id),
        title : "Change enemy data"});
    help_variable = req.body.Id;
});

app.post("/dbms/add", (req, res) =>{
    if(ValidateInputTypes(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage)){
        AddEnemyData(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage);
        res.redirect("/dbms");
    }
    else{
        res.status(400);
        res.render("error",
        { title : "error 400" }
        );
    }
});
app.post("/dbms/delete", (req, res)=>{
        DeleteEnemyData(req.body.Id);
        res.redirect("/dbms");
});
app.post("/dbms/change", (req, res)=>{
    if(ValidateInputTypes(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage)){
        ChangeEnemyData(help_variable, req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage);
        help_variable = undefined;
        res.redirect("/dbms");
    }
    else{
        res.status(400);
        res.render("error",
        { title : "error 400" }
        );
    }
});


app.listen(port, () =>{
    console.log(`Server listening on http://localhost:${port}`);
});