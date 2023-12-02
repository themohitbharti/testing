require("dotenv").config()

const Text = require('../models/textModel.js');

const jwt=require("jsonwebtoken");

const addTextController = async (req, res) => {
    try {
      const { teamId } = req.params;
      const authorizationHeader = req.headers.authorization;
  
      if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
      }
  
      const decodedToken = jwt.verify(authorizationHeader, process.env.SECRET_KEY_JWT);
  
      const email = decodedToken.email;
  
      const { text } = req.body;
  
      const newText = new Text({
        teamId,
        text,
        email,
      });
  
      const savedText = await newText.save();
  
      res.status(201).json({
        success: true,
        message: "Text has successfully been saved!",
        //
        email:email,
        
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const showTextController = async (req, res) => {
    try {
      const { teamId } = req.params;
  
      
      const texts = await Text.find({ teamId });
  
      
      const uniqueEmails = [...new Set(texts.map((text) => text.email))];
  
      
      const textsByMember = uniqueEmails.map((email) => ({
        email,
        texts: texts
          .filter((text) => text.email === email)
          .map((text) => ({ text: text.text, createdAt: text.createdAt })), // Include additional fields as needed
      }));
  
      res.status(200).json({
        success: true,
        data: textsByMember,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  
  
module.exports={
    addTextController,showTextController
}