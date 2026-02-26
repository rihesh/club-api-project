const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/ApiController');

router.get('/list_modules/:key/:appid', ApiController.list_modules);
router.get('/content_list/:module_id', ApiController.get_content_list);
router.get('/content_detail/:item_id', ApiController.get_content_detail);
router.get('/upcoming_events', ApiController.get_upcoming_events);
router.get('/app_settings/:app_id', ApiController.get_app_settings);
router.post('/login', ApiController.login);

module.exports = router;
