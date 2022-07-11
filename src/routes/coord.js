const { Router } = require('express');
const router = Router();

const inventoryController = require('../controllers/coordinator/inventoryController');
const userController = require('../controllers/coordinator/userController');

router

.get('/coordinator', inventoryController.main)
.post('/coordinator/add-items', inventoryController.addItems)
.post('/coordinator/delete-items', inventoryController.deleteItems)
.post('/coordinator/modify-items', inventoryController.modifyItems)

.get('/coordinator/employees', userController.main)
.post('/coordinator/employees/get-users', userController.getUsers)
.post('/coordinator/employees/add-users', userController.addUsers)
.post('/coordinator/employees/delete-users', userController.deleteUsers)
.post('/coordinator/employees/modify-users', userController.modifyUsers)

module.exports = router;