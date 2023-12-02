require('dotenv').config();
// import cloudinary from './node_modules/cloudinary-core/src/index';
const express= require ("express");
const session = require("express-session"); 
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {createServer} = require("http");
const {Server} = require("socket.io");
const jwt=require("jsonwebtoken");
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const{setUser,getUser}=require("./middleware/auth");

const connectDB = require("./config/db");
//const imgSchema = require('./models/teamModel.js');
// const multer = require('multer');
const fs = require('fs');
const path = require('path');

const Chat = require("./models/chatModel");

const teamRoutes = require("./routes/teamRoutes.js");
const userRoutes=require("./routes/userRoutes.js");
const mlDataRoutes=require("./routes/mlDataRoutes.js");
const textRoutes=require("./routes/textRoutes.js");
const chatRoutes=require("./routes/chatRoutes.js");
const imageRoutes =require("./routes/imageRoutes.js");
const leaveRoutes=require("./routes/leaveRoutes.js");

connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret:process.env.API_SECRET
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true
}));

app.use(bodyParser.urlencoded({
    extended: true
  }));

  const passport=require("passport");
  const GoogleStrategy = require("passport-google-oauth20").Strategy;
  
  const User=require("./models/userModel");  
  const{send_mail_registration}=require("./controllers/mailController");
  const{isUserPresent}=require("./controllers/userController");
  app.use("/team",teamRoutes);
  app.use("/user",userRoutes);
  app.use("/mlData",mlDataRoutes);
  app.use("/text",textRoutes);
  app.use("/chat",chatRoutes);
  app.use("/image",imageRoutes);
  app.use("/leave",leaveRoutes);
  app.use(session({
    secret: process.env.SECRET_KEY_SESSION, 
    resave: false,
    saveUninitialized: false
  }));
  
  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.URL}/auth/google/callback`,
  },
  function(accessToken, refreshToken, profile, cb) {

        User.findOrCreate({
        name: profile.displayName,
        email: profile.emails[0].value,
        },
        function(err, user) {
        return cb(err, user);
      });
  }
));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, cb) {
    cb(null, user); 
  });
  
  passport.deserializeUser(function(user, cb) {
    cb(null, user);
  });

app.get("/googleOAuth", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "/register",
  failureRedirect: "/error",
}));

app.get("/error",async(req,res)=>{
    return res.json("Error while verifying user");
  });

  app.get("/register",(req,res)=>{
    if(req.isAuthenticated()){
        const user=req.user;
        const email=user.email;
        const name=user.name;
        send_mail_registration(email,name);
        const token = setUser(user);
            
        return res.json(token); 

    

    return res.json("User entered successfully!");
    
  
    }else{
      return res.status(401).json("Please signup first");
    }
  }); 


  //IMAGE ROUTES

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });

// const upload = multer({ storage: storage });

// const imgSchema = new mongoose.Schema({
//   teamId: {
//     type: String,
//     required: true,
//   },
//   name: String,
//   desc: String,
//   img: {
//     data: Buffer,
//     contentType: String,
//   },
// });

// const Image = mongoose.model('Image', imgSchema);


// app.get('/image/showImg/:teamId', (req, res) => {
//     const { teamId } = req.params;

//     Image.find({ teamId })
//         .then((data, err) => {
//             if (err) {
//                 console.log(err);
//                 res.status(500).json({ error: 'Internal Server Error' });
//             } else {
//                 res.json({ items: data });
//             }
//         });
// });


// app.post('/image/uploadImg/:teamId', upload.single('img'), (req, res, next) => {
//   const { teamId } = req.params;

//   const obj = {
//       teamId: teamId,
//       name: req.body.name,
//       desc: req.body.desc,
//       img: {
//           data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
//           contentType: req.file.mimetype,
//       },
//   };

//   Image.create(obj)
//       .then((item) => {
//           res.status(201).json({
//               success: true,
//               message: 'File successfully uploaded.',
              
//           });
//       })
//       .catch((err) => {
//           console.log(err);
//           res.status(500).json({ error: 'Internal Server Error' });
//       });
// });


const PORT = process.env.PORT || 4000;

app.route("/").get((req, res) => {
    res.json({message: "Hello World"});
})


server=app.listen(PORT,()=>{
    console.log(`server started at ${PORT}`);
})




const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('Socket connected' , socket.id);
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });
    socket.on('message', async (data) => {
        console.log('Message received on server: ', data);
        socket.broadcast.emit('message', data);


        try {
                    const { username, message } = data;
          
                    const chatMessage = new Chat({
                        username: username,
                        message: message,
                    });
          
                    await chatMessage.save();
        } catch (error) {
                    console.error('Error saving chat message:', error);
                }



    });
}   );