require("dotenv").config();
jwt = require('jsonwebtoken');
// import cloudinary from '../node_modules/cloudinary-core/src/index';
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const Image = require('../models/imageModel.js');
const User = require('../models/userModel.js');




const addImageController = async (req, res) => {
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

  const files = req.files.photo;
  const teamId = req.body.teamId; // Assuming teamId is passed in the request body

  cloudinary.uploader.upload(files.tempFilePath, function (err, result) {
      if (err) {
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }

      const { imgName } = req.body;

      const newImage = new Image({
          imgName: imgName,
          userEmail: email,
          img: result.secure_url,
          teamId: teamId, // Assign teamId to the image
      });

      newImage.save()
          .then(() => res.json('Image added!'))
          .catch(err => res.status(400).json('Error: ' + err));
  });
};



const showImageController = async (req, res) => {
    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
  
    const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
    const email = decodedToken.email;
  
    const { teamId } = req.params; 
  
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const images = await Image.find({ userEmail: email, teamId: teamId });
      if (!images || images.length === 0) {
        return res.status(404).json({ error: 'No images found for the given user and teamId' });
      }
  
      const imageList = images.map(image => ({ imgURL: image.img, imgName: image.imgName }));
      res.json(imageList);
    } catch (error) {
      console.error('Error retrieving images:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports = {
  addImageController,
  showImageController,
};
