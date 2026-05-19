import express from "express";
import cookieParser from "cookie-parser";

import { getAllEnemyData, getEnemyDataById, validateInputTypes ,addEnemyData, deleteEnemyData, changeEnemyData } from "./functionality/db_handlers.js";
import { createUser, loginUser, findUserById, accountCreationHandler, assignUserDataToSession } from "./functionality/user_handler.js";
import { deleteSession, getSessionInfoById, SESSION_COOKIE_NAME } from "./functionality/session_handler.js";

const PORT = 8000;

const APP = express();
APP.set("view engine", "ejs");

APP.use(express.static("public"));
APP.use(express.urlencoded());
APP.use(cookieParser());

var help_variable;
var user;

APP.get("/", (req, res) =>{
    if(!isNaN(req.cookies[SESSION_COOKIE_NAME]) && user == null){
        user = assignUserDataToSession(req, SESSION_COOKIE_NAME);   
    }

    res.render("enemies",
    {title : "Hunters Journal",
    enemies : getAllEnemyData(),
    is_cookie : !isNaN(req.cookies[SESSION_COOKIE_NAME]),
    user_name: user?.username
    });
});

APP.get("/contributions", (req, res) =>{
    res.render("contributions",
    {title : "Hunters Journal",
    enemies : getAllEnemyData(),
    is_cookie : !isNaN(req.cookies[SESSION_COOKIE_NAME]),
    user_name: user?.username,
    user_id: user?.user_id,
    admin_user: user?.isAdmin,
    CSRF_Token: user?.CSRF_Token
    });
});

APP.get("/sing_up", (req, res) =>{
    res.render("sign_up", 
    {title : "Account creation",
    creation_msg : "",
    is_cookie : !isNaN(req.cookies[SESSION_COOKIE_NAME]),
    user_name: user?.username,
    });
});

APP.get("/sign_in", (req, res) =>{
    res.render("sign_in", {
        title: "Account log in",
        creation_msg : "",
        is_cookie : !isNaN(req.cookies[SESSION_COOKIE_NAME]),
        user_name: user?.username,
    });
});

APP.post("/sign_out", (req, res) =>{
    deleteSession(req.cookies[SESSION_COOKIE_NAME]);
    res.clearCookie(SESSION_COOKIE_NAME);
    user = null;

    res.redirect("/");
    res.end();
});

APP.post("/account_sign_up", (req, res) =>{
    accountCreationHandler(req, res, SESSION_COOKIE_NAME);
});

APP.post("/account_sign_in", (req, res) =>{
    loginUser(req.body.login, req.body.password, res, req);
});

APP.post("/contributions/pre_change", (req, res)=>{
    res.render("change_menu",
        {enemy : getEnemyDataById(req.body.Id),
        title : "Change enemy data",
        is_cookie : !isNaN(req.cookies[SESSION_COOKIE_NAME]),
        user_name: user.username,
        CSRF_Token: user.CSRF_Token
    });
    help_variable = req.body.Id;
});

APP.post("/contributions/add", (req, res) =>{
    if(validateInputTypes(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, req.body.CSRF_Token, user)){
        addEnemyData(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, user);
        res.redirect("/contributions");
    }
    else{
        res.status(400);
        res.render("error", { 
        title : "error 400",
        desc : "Something went wrong with the input validation, please make sure that the given by you data was inline with the instructions"
        });
    }
});
APP.post("/contributions/delete", (req, res)=>{
        deleteEnemyData(req.body.Id, req.body.CSRF_Token, user);
        res.redirect("/contributions");
});
APP.post("/contributions/change", (req, res)=>{
    if(validateInputTypes(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, req.body.CSRF_Token, user)){
        changeEnemyData(req.body.Name, req.body.Enemy_Type, req.body.Geo_Dropped, req.body.Health, req.body.Damage, help_variable);
        help_variable = undefined;
        res.redirect("/contributions");
    }
    else{
        res.status(400);
        res.render("error", { 
        title : "error 400",
        desc : "Something went wrong with the input validation, please make sure that the given by you data was inline with the instructions"
        });
    }
});

APP.listen(PORT, () =>{
    console.log(`Server listening on http://localhost:${PORT}`);
});