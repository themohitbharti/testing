const express = require("express");
const router = express.Router();

const handleUserSignup = require("../controllers/userController.js").handleUserSignup;
const handleUserLogin = require("../controllers/userController.js").handleUserLogin;
const resetPassword = require("../controllers/userController.js").resetPassword;
const verifyOTP = require("../controllers/userController.js").verifyOTP;
const newPassword = require("../controllers/userController.js").newPassword;
const sendMessage= require("../controllers/userController.js").sendMessage;
const checkUserRole= require("../controllers/userController.js").checkUserRole;
const DecodeJWT= require("../controllers/userController.js").DecodeJWT;
const verifyMail= require("../controllers/userController.js").verifyMail;

router.post("/signup",handleUserSignup);

router.post("/login",handleUserLogin);

router.post("/resetPassword",resetPassword);

router.post("/verifyOTP/:email",verifyOTP);

router.post("/newPassword/:email",newPassword);

router.post("/sendMessage/:teamId",sendMessage);

router.get("/checkUser/:teamId",checkUserRole);

router.get("/sendName",DecodeJWT);

router.get("/verifyEmail/:Email",verifyMail);


module.exports=router;

