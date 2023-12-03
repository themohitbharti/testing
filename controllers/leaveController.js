require("dotenv").config()

const User = require('../models/userModel.js');
const Team = require('../models/teamModel.js');
const Leave = require('../models/leaveModel.js');

const {send_mail_leave,send_mail_accept,send_mail_reject}=require("./mailController");

const jwt=require("jsonwebtoken");

const ApplyleaveController = async (req, res) => {
  
    const { teamId } = req.params;
    try{
    const authorizationHeader = req.headers.authorization;
    
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    
    const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
    
    const email = decodedToken.email;
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const { leaves } = req.body;

    /*if (!leaves.startDate) {
      return res.status(400).json("Enter start date");
    }
    if (!leaves.endDate) {
      return res.status(400).json("Enter end date");
    }
    if (!leaves.reason) {
      return res.status(400).json("Enter reason");
    }*/

    const URL = process.env.URL;
    const leaderEmail = team.leaderEmail;

  console.log("leaderEmail:",leaderEmail);
    if (leaderEmail === email) {
      const LEAVE={
        teamId:teamId,
        email:email,
        leaves:leaves,
        Status:"Accepted"
      };
      const leaveinfo=await Leave.create(LEAVE);
      const leaveId=leaveinfo._id;
      console.log("leaveid:",leaveId);
      
      return res.json("Leave has been granted successfully!");
    } else {
      const LEAVE={
        teamId:teamId,
        email:email,
        leaves:leaves,
        Status:"Pending..."
      };
      const latestLeaveEntry = leaves[leaves.length - 1];

  const startDate = latestLeaveEntry.startDate;
  const endDate = latestLeaveEntry.endDate;
  const reason = latestLeaveEntry.reason;
      const leaveinfo=await Leave.create(LEAVE);
      const leaveId=leaveinfo._id;
      console.log("leaveid:",leaveId);
      send_mail_leave(leaderEmail, email,startDate,endDate,reason,URL,leaveId);

      return res.json(leaveinfo);
      return res.json("Your request has been submitted to the leader");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const LeaveapprovalController=async(req,res)=>{
  try{

  const { leaveId } = req.params;
  const answer=req.query.answer;
  const user=await Leave.findOne({"_id":leaveId});

  if (!user) {
    return res.status(404).json({ error: 'Leave not found' });
  }

  if (user.Status === 'Accepted' || user.Status === 'Rejected') {
    return res.status(400).json({ message: `Leave has already been ${user.Status}` });
  }
  const email=user.email;
  console.log("email:",email);

  const LEAVES=user.leaves;
  console.log("LEAVES:",LEAVES);
  const latestLeaveEntry = LEAVES[0];
  console.log("latestLeaveEntry:",latestLeaveEntry);
  const startDate = latestLeaveEntry.startDate;
  const endDate = latestLeaveEntry.endDate;
  const reason = latestLeaveEntry.reason;

  
  if(answer==="accept"){
    send_mail_accept(email,startDate,endDate,reason);
    user.Status = 'Accepted';
    await user.save();
    return res.json("You have approved the leave");
  }
  else{
    send_mail_reject(email,startDate,endDate,reason);
    user.Status='Rejected';
    await user.save();

    return res.json("You have rejected the leave");

  }

}catch(error){
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}
};
      module.exports={
        ApplyleaveController,LeaveapprovalController
      }
            
    
