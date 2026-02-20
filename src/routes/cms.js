const express = require('express');
const router = express.Router();
const CMSController = require('../controllers/CMSController');

router.get('/structure/:function_id', CMSController.getStructure);
router.get('/content/:function_id', CMSController.getContent);
router.get('/content/:function_id/:id', CMSController.getContentItem);
router.post('/content/:function_id', CMSController.saveContent);
router.delete('/content/:function_id/:id', CMSController.deleteContent);

module.exports = router;
