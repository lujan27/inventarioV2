const { Router } = require('express');
const { isAuthCoord } = require('../config/sessionCoord');
const router = Router();

const inventoryController = require('../controllers/coordinator/inventoryController');
const userController = require('../controllers/coordinator/userController');

router

.get('/coordinator',isAuthCoord, inventoryController.main)
.post('/coordinator/add-items',isAuthCoord, inventoryController.addItems)
.post('/coordinator/delete-items',isAuthCoord, inventoryController.deleteItems)
.post('/coordinator/modify-items',isAuthCoord, inventoryController.modifyItems)

.get('/coordinator/employees',isAuthCoord, userController.main)
.post('/coordinator/employees/get-users',isAuthCoord, userController.getUsers)
.post('/coordinator/employees/add-users',isAuthCoord, userController.addUsers)
.post('/coordinator/employees/delete-users',isAuthCoord, userController.deleteUsers)
.post('/coordinator/employees/modify-users',isAuthCoord, userController.modifyUsers)

module.exports = router;