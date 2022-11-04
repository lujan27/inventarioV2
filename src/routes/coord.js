const { Router } = require('express');
const { isAuthCoord } = require('../config/sessionCoord');
const router = Router();

const inventoryController = require('../controllers/coordinator/inventoryController');
const userController = require('../controllers/coordinator/userController');
const ordersController = require('../controllers/ordersController');
const userModel = require('../models/users/userModel');

router

.get('/coordinator', isAuthCoord, inventoryController.main)
.post('/coordinator/add-items', isAuthCoord, inventoryController.addItems)
.post('/coordinator/delete-items', isAuthCoord, inventoryController.deleteItems)
.post('/coordinator/modify-items', isAuthCoord, inventoryController.modifyItems)

// .get('/coordinator/employees', isAuthCoord, userController.main)
.get('/coordinator/employees', isAuthCoord, async (req, res) => {
    const usuarios = await userModel.aggregate([
        {
            '$match': {
                'ranch': req.user.ranch
            }
        },
        {
            '$match': {
                'role': 'usuario'
            }
        }
    ])

    res.render('coordinator/users', {
        doc_title: 'Usuarios',
        usuarios
    })
})
.post('/coordinator/employees/get-users', isAuthCoord, userController.getUsers)
.post('/coordinator/employees/add-users', isAuthCoord, userController.addUsers)
.post('/coordinator/employees/delete-users', isAuthCoord, userController.deleteUsers)
.post('/coordinator/employees/modify-users', isAuthCoord, userController.modifyUsers)

// Ruta /coordinator/orders
.get('/coordinator/orders', isAuthCoord, ordersController.main)

module.exports = router;