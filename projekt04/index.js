import express from "express";
import { getAllEnemyData, getEnemyData, ValidateInputTypes ,AddEnemyData, DeleteEnemyData, ChangeEnemyData } from "./functionality/db_handlers.js";
import { createUser, LoginUser, find_user_by_id } from "./functionality/user_handler.js";
import { deleteSession, getSessionInfoById } from "./functionality/session_handler.js";
import cookieParser from "cookie-parser";

const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded())
app.use(cookieParser());

var help_variable;

app.get("/", (req, res) =>{
    if(!isNaN(req.cookies['session'])){
        let user_id = Number(Object.values(getSessionInfoById(req.cookies['session']))[1]);
        res.locals.username = String(Object.values(find_user_by_id(user_id))[2]);
    }
    res.render("enemies",
    {title : "Hunters Journal",
    enemies : getAllEnemyData(),
    is_cookie : !isNaN(req.cookies['session']),
    user_name: res.locals.username
    });
});

app.get("/dbms", (req, res) =>{
    if(!isNaN(req.cookies['session'])){
        res.locals.user_id = Number(Object.values(getSessionInfoById(req.cookies['session']))[1]);
        res.locals.username = String(Object.values(find_user_by_id(res.locals.user_id))[2]);
        res.locals.isAdmin = Number(Object.values(find_user_by_id(res.locals.user_id))[1]);
        res.locals.CSRF_Token = String(Object.values(getSessionInfoById(req.cookies['session']))[3]);
    }
    res.render("dbms",
    {title : "Contributions",
    enemies : getAllEnemyData(),
    is_cookie : !isNaN(req.cookies['session']),
    user_name: res.locals.username,
    user_id: res.locals.user_id,
    admin_user: res.locals.isAdmin,
    CSRF_Token: res.locals.CSRF_Token
    });
});

app.get("/sing_up", (req, res) =>{
    res.render("sign_up", 
    {title : "Account creation", 
    is_cookie : !isNaN(req.cookies['session']),
    user_name: res.locals.username,
    });
});

app.get("/sign_in", (req, res) =>{
    res.render("sign_in", {
        title: "Account log in",
        is_cookie : !isNaN(req.cookies['session']),
        user_name: res.locals.username,
    });
});

app.post("/log_out", (req, res) =>{
    deleteSession(req.cookies['session']);
    res.clearCookie('session');
    res.redirect("/");
    res.end();
});

app.post("/account_create", (req, res) =>{
    if(createUser(req.body.login, req.body.password, req.body.password_repeat)){
        res.redirect("/sign_in");
    }
    else{
        res.render("error", {
            title: "error 400",
            desc: "the account creation process"
        });
    }
});

app.post("/account_log_in", (req, res) =>{
    LoginUser(req, res);
});

app.post("/dbms/pre_change", (req, res)=>{
    if(!isNaN(req.cookies['session'])){
        res.locals.CSRF_Token = String(Object.values(getSessionInfoById(req.cookies['session']))[3]);
        res.locals.user_id = Number(Object.values(getSessionInfoById(req.cookies['session']))[1]);
        res.locals.username = String(Object.values(find_user_by_id(res.locals.user_id))[2]);
    }
    res.render("change_menu",
        {enemy : getEnemyData(req.body.Id),
        title : "Change enemy data",
        is_cookie : !isNaN(req.cookies['session']),
        user_name: res.locals.username,
        CSRF_Token: res.locals.CSRF_Token
    });
    help_variable = req.body.Id;
});

app.post("/dbms/add", (req, res) =>{
    if(ValidateInputTypes(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, req.body.CSRF_Token, req)){
        AddEnemyData(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, req);
        res.redirect("/dbms");
    }
    else{
        res.status(400);
        res.render("error",
        { title : "error 400",
        desc : "input validation"
        });
    }
});
app.post("/dbms/delete", (req, res)=>{
        DeleteEnemyData(req.body.Id, req.body.CSRF_Token, req);
        res.redirect("/dbms");
});
app.post("/dbms/change", (req, res)=>{
    if(ValidateInputTypes(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, req.body.CSRF_Token, req)){
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