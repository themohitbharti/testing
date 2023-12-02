require("dotenv").config()

const User = require('../models/userModel.js');
const Team = require('../models/teamModel.js');
const {send_team_code}=require("./mailController.js");
const jwt=require("jsonwebtoken");


function generateTeamCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let teamCode = '';
    for (let i = 0; i < 6; i++) {
      teamCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return teamCode;
  }

const createTeamController = async (req, res) => {
    const {  teamName, domains } = req.body;
  

  try {

    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const decodedToken = jwt.verify(authorizationHeader,process.env.SECRET_KEY_JWT);

    const leaderEmail = decodedToken.email;

    const leaderUser = await User.findOne({ email: leaderEmail });

    if (!leaderUser) {
      return res.status(404).json({ error: 'access denied' });
    }

   
    const teamCode = generateTeamCode();

    const newTeam = new Team({
    
      leaderEmail:leaderEmail,
      teamName: teamName,
      domains: domains,
      teamCode: teamCode,
    });

   
    const savedTeam = await newTeam.save();

    res.json({ success: true, team: savedTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const getTeamsController = async (req, res) => {
  try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
          return res.status(401).json({ error: 'Authorization header missing' });
      }

      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);

      const email = decodedToken.email;

      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const teams = await Team.find({
          $or: [
              { 'domains.members': email },
              { leaderEmail: email },
          ],
      });

      res.json({ success: true, email, teams });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

  
  



const sendTeamcodeController = async (req, res) => {
  try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
          return res.status(401).json({ error: 'Authorization header missing' });
      }

      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
      const leaderEmail = decodedToken.email;

      const leaderUser = await User.findOne({ email: leaderEmail });

      if (!leaderUser) {
          return res.status(404).json({ error: 'Access denied' });
      }

      const { teamId, domainName } = req.params;
      const { recipients } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
          return res.status(400).json({ error: 'No recipients defined' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
          return res.status(404).json({ error: 'Team not found' });
      }

      const teamCode = team.teamCode;

      for (const email of recipients) {
        
       await send_team_code(email, teamCode, domainName);

          const user = await User.findOne({ email });
          if (user) {
             
              const isAlreadyAssigned = user.assignedTeams.some(
                  (assignment) =>
                      assignment.teamId.toString() === teamId && assignment.domain === domainName
              );

              if (!isAlreadyAssigned) {
                  user.assignedTeams.push({
                      teamId,
                      domain: domainName,
                  });
                  await user.save();
              }
          }
          else {
            return res.status(400).json({ error: `${email} is not a user on the app` });
          }
      }

      return res.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};







  

  const joinTeamController = async (req, res) => {
    try {
        const { teamCode } = req.body;
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
        const email = decodedToken.email;

       
        const team = await Team.findOne({ teamCode });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

       
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

      
        if (user.assignedTeams.length === 0) {
            return res.status(400).json({ error: 'User is not assigned to any teams' });
        }

        const isUserAlreadyMember = team.domains.some((domain) =>
            domain.members.includes(email)
        );

        if (isUserAlreadyMember) {
            return res.status(400).json({ error: 'User is already a member of some domain in the team' });
        }

        
        const assignedTeam = user.assignedTeams.find(
          (assignedTeam) => assignedTeam.teamId.toString() === team._id.toString()
      );
      
      if (!assignedTeam) {
          return res.status(400).json({ error: 'User is not assigned to the specified team' });
      }
      
      const isValidDomain = team.domains.some(
          (domain) => domain.name === assignedTeam.domain
      );
      
      if (!isValidDomain) {
          return res.status(400).json({ error: 'Invalid domain assigned to the user for the specified team' });
      }
      
      
      const domainIndex = team.domains.findIndex((domain) => domain.name === assignedTeam.domain);
      
      if (domainIndex === -1) {
          return res.status(400).json({ error: 'Invalid domain assigned to the user for the specified team' });
      }
      
      team.domains[domainIndex].members.push(email);
      await team.save();
     

        res.json({ success: true, message: 'User added to the team and domain successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};






  const getTeamByCodeController = async (req, res) => {
    try {
      const { teamCode } = req.params;
  
      
      const team = await Team.findOne({ teamCode });
  
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      res.json({ success: true, team });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };



  const addTaskController = async (req, res) => {
    try {

      const authorizationHeader = req.headers.authorization;
    
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const decodedToken = jwt.verify(authorizationHeader,process.env.SECRET_KEY_JWT);
    
    const leadEmail = decodedToken.email;
    

      const { teamCode } = req.params;
      const { domainName, email, task, deadline } = req.body;
  
      
      const team = await Team.findOne({ teamCode });
  
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      if (team.leaderEmail !== leadEmail) {
        return res.status(403).json({ error: 'Only the team leader is allowed to add tasks' });
      }
  
     
      const domain = team.domains.find((domain) => domain.name === domainName);
  
      if (!domain) {
        return res.status(404).json({ error: 'Domain not found within the team' });
      }

      const isEmailInDomain = domain.members.includes(email);
      if (!isEmailInDomain) {
        return res.status(400).json({ error: 'Assigned email is not a member of the specified domain' });
      }

      const isTaskAssigned = domain.tasks.some(
        (taskObj) => taskObj.assignedTo === email && taskObj.description === task
      );
      if (isTaskAssigned) {
        return res.status(400).json({ error: 'Task already assigned to the specified email' });
      }
  
      domain.tasks.push({
        description: task,
        assignedTo: email,
        deadline: deadline,
        completed: false, 
      });
  
      
      await team.save();
  
      res.json({ success: true, message: 'Task added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  const taskCompletedController = async (req, res) => {
    try {

      const authorizationHeader = req.headers.authorization;
    
      if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
      }
  
      const decodedToken = jwt.verify(authorizationHeader,process.env.SECRET_KEY_JWT);
      
      const leadEmail = decodedToken.email;

      const { teamCode, domainName, email, task } = req.body;
  
     
      const team = await Team.findOne({ teamCode });
  
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }


      if (team.leaderEmail !== leadEmail) {
        return res.status(403).json({ error: 'Only the team leader is allowed to mark tasks' });
      }
  
      
      const domain = team.domains.find((domain) => domain.name === domainName);
  
      if (!domain) {
        return res.status(404).json({ error: 'Domain not found within the team' });
      }
  
     
      const taskToComplete = domain.tasks.find(
        (taskObj) => taskObj.assignedTo === email && taskObj.description === task
      );
  
      if (!taskToComplete) {
        return res.status(404).json({ error: 'Task not found for the specified email and description' });
      }
  
      taskToComplete.completed = true;
  
      await team.save();
  
      res.json({ success: true, message: 'Task marked as completed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const leaderResignController = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
  
      if (!authorizationHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }
  
      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
  
      const email = decodedToken.email;

      const leaderUser = await User.findOne({ email: email });

    if (!leaderUser) {
      return res.status(404).json({ error: 'access denied' });
    }

  
      const { teamId } = req.params;
  
      const team = await Team.findOne({ "_id": teamId });
  
      if (email === team.leaderEmail) {
        const body = req.body;
        const newLeaderEmail = body.Email;
  
        if (!newLeaderEmail) {
          return res.status(400).json({ error: "Please enter new leader's email" });
        }
  
        const domainWithMember = team.domains.find((domain) => domain.members.includes(newLeaderEmail));
  
        if (!domainWithMember) {
          return res.status(400).json({ error: "New leader is not present in any domain" });
        }
  
        domainWithMember.members = domainWithMember.members.filter(member => member !== newLeaderEmail);
  
        team.leaderEmail = newLeaderEmail;
        await team.save();
  
        return res.status(200).json({ message: "New leader assigned" });
      } else {
       
        return res.status(403).json({ error: "You can't leave without the leader's permission" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  //
  const completedTaskController = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
  
      if (!authorizationHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }
  
      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
  
      const email = decodedToken.email;

      const leaderUser = await User.findOne({ email: email });

    if (!leaderUser) {
      return res.status(404).json({ error: 'access denied' });
    }
  
      
      const teams = await Team.find({
        $or: [
          { leaderEmail: email },
          { "domains.members": email }
        ]
      });
  
      if (!teams || teams.length === 0) {
        return res.json({ completedTasks: [] });
      }
  
      let completedTasks = [];
  
      teams.forEach((team) => {
        team.domains.forEach((domain) => {
          domain.tasks.forEach((task) => {
            if (task.completed) {
              completedTasks.push({
                description: task.description,
                assignedTo: task.assignedTo,
                deadline: task.deadline
              });
            }
          });
        });
      });
  
      res.json({ completedTasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  //

  const incompleteTaskController = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
  
      if (!authorizationHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }
  
      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
  
      const email = decodedToken.email;
  
      const leaderUser = await User.findOne({ email: email });

    if (!leaderUser) {
      return res.status(404).json({ error: 'access denied' });
    }


      const teams = await Team.find({
        $or: [
          { leaderEmail: email },
          { "domains.members": email }
        ]
      });
  
      if (!teams || teams.length === 0) {
        return res.json({ incompleteTasks: [] });
      }
  
      let incompleteTasks = [];
  
      teams.forEach((team) => {
        team.domains.forEach((domain) => {
          domain.tasks.forEach((task) => {
            if (!task.completed) {
              incompleteTasks.push({
                description: task.description,
                assignedTo: task.assignedTo,
                deadline: task.deadline
              });
            }
          });
        });
      });
  
      res.json({ incompleteTasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  const deleteMemberController = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
  
      if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
      }
  
      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
      const leaderEmail = decodedToken.email;
  
      const { teamId } = req.params;
      const { memberEmail } = req.body;
  
      const team = await Team.findById(teamId);
  
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      if (team.leaderEmail !== leaderEmail) {
        return res.status(403).json({ error: 'Only the team leader is allowed to remove members' });
      }
  
      if (memberEmail === leaderEmail) {
        return res.status(400).json({ error: 'The team leader cannot be removed' });
      }
  
      let isMemberRemoved = false;
  
      team.domains.forEach((domain) => {
        if (domain.members.includes(memberEmail)) {
         
          domain.members = domain.members.filter((member) => member !== memberEmail);
          isMemberRemoved = true;
        }
      });
  
      if (!isMemberRemoved) {
        return res.status(400).json({ error: 'Member not found in any domain of the team' });
      }
  
      await team.save();
  
      return res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
module.exports = {
    createTeamController,
    getTeamsController,
    sendTeamcodeController,
    joinTeamController,
    getTeamByCodeController,
    addTaskController,
    taskCompletedController,
    leaderResignController,
    completedTaskController,
    incompleteTaskController,
    deleteMemberController,
}
