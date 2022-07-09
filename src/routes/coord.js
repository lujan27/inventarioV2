const { Router } = require('express');
const router = Router();

const inventoryController = require('../controllers/coordinator/inventoryController');
const userController = require('../controllers/coordinator/userController');

router

.get('/coordinator/', inventoryController.main)
.post('/coordinator/addItems/', inventoryController.addItems)
.post('/coordinator/deleteItems/', inventoryController.deleteItems)
.post('/coordinator/modifyItems/', inventoryController.modifyItems)

.get('/coordinator/employees/', userController.main)

module.exports = router;