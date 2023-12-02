
const Chat = require('../models/chatModel.js');


const getAllChatsController = async (req, res) => {
    try {
        // Fetch all chat messages
        const chats = await Chat.find().sort({ createdAt: 'asc' });

        res.json({ success: true, chats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    getAllChatsController,
   
};