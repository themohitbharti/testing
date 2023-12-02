

const express = require('express');
const router = express.Router();
const MlDataController = require('../controllers/mlDataController');



router.post('/save-json', MlDataController.saveJsonController);
router.get('/get-json', MlDataController.getJsonController);



module.exports = router;
