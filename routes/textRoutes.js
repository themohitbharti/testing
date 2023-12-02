const express = require("express");
const router = express.Router();

const addTextController = require("../controllers/textController.js").addTextController;
const showTextController = require("../controllers/textController.js").showTextController;


router.post("/addText/:teamId",addTextController );

router.get("/showText/:teamId",showTextController);

module.exports = router;
