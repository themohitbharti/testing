const express = require("express");
const router = express.Router();



const  ApplyleaveController= require("../controllers/leaveController.js").ApplyleaveController;
const  LeaveapprovalController= require("../controllers/leaveController.js").LeaveapprovalController;


router.post("/applyLeave/:teamId",ApplyleaveController);
router.get("/leaveResult/:leaveId",LeaveapprovalController);


module.exports = router;