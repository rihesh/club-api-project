const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

const SuperAdminController = require('../controllers/SuperAdminController');
const AllotmentController = require('../controllers/AllotmentController');

router.post('/login', AdminController.login);
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/modules', AdminController.getModules);
router.put('/modules/status', AdminController.updateModuleStatus);
router.get('/users', AdminController.getUsers); // Ensure we have this for dropdown
router.post('/users', AdminController.createUser);

// Super Admin Routes
router.post('/modules/add', SuperAdminController.createModule);
router.get('/field-types', SuperAdminController.getFieldTypes);
router.post('/fields/:function_id', SuperAdminController.addField);
router.delete('/fields/:field_id', SuperAdminController.deleteField);

// Allotment Routes
router.get('/allotments', AllotmentController.getAllotments);
router.post('/allotments', AllotmentController.createAllotment);
router.delete('/allotments/:id', AllotmentController.deleteAllotment);

// App Settings Routes
const SettingsController = require('../controllers/SettingsController');
router.get('/settings', SettingsController.getSettings);
router.post('/settings', SettingsController.saveSettings);

module.exports = router;
