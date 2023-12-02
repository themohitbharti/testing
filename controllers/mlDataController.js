
const MlData = require('../models/mlDataModel');

const saveJsonController = async (req, res) => {
  try {
    
    const jsonData = req.body;

    if (!jsonData || typeof jsonData !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON data provided' });
    }

    const jsonDataArray = Object.entries(jsonData).map(([key, value]) => ({ key, value }));

    await MlData.create(jsonDataArray);

    res.json({ success: true, message: 'JSON data saved to the MlData model' });
  } catch (error) {
    console.error('Error saving JSON data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getJsonController = async (req, res) => {
    try {
      const allJsonData = await MlData.find();
  
      res.json({ success: true, data: allJsonData });
    } catch (error) {
      console.error('Error fetching JSON data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports = { saveJsonController ,getJsonController};
