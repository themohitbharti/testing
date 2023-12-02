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
  const teamId = req.body.teamId; 

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

  const { imgName, teamId } = req.params; 

  try {
      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      console.log(imgName);

      const image = await Image.findOne({ userEmail: email, imgName: imgName, teamId: teamId });
      if (!image) {
          return res.status(404).json({ error: 'Image not found for the given user, name, and teamId' });
      }

      console.log(image);

      res.json({ imgURL: image.img, imgName: image.imgName });
  } catch (error) {
      console.error('Error retrieving image:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addImageController,
  showImageController,
};
