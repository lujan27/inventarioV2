const { Router } = require('express');
const { isAuthCoord } = require('../config/sessionCoord');
const countOrdersCtrl = require('../controllers/coordinator/countOrdersCtrl');
const router = Router();

const inventoryController = require('../controllers/coordinator/inventoryController');
const userController = require('../controllers/coordinator/userController');
const ordersController = require('../controllers/ordersController');

const ordersModel = require('../models/ordersModel');
const userModel = require('../models/users/userModel');

router

.get('/coordinator', isAuthCoord, inventoryController.principal)
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

    const contCoord = await ordersModel.aggregate([
        {
          '$match': {
            'status': 'Solicitado'
          }
        }, {
          '$match': {
            'userRanch': req.user.ranch
          }
        },
        {
          '$count': 'status'
        }
      ]);  

    res.render('coordinator/users', {
        doc_title: 'Usuarios',
        usuarios,
        contCoord
    })
})
.post('/coordinator/employees/get-users', isAuthCoord, userController.getUsers)
.post('/coordinator/employees/add-users', isAuthCoord, userController.addUsers)
.post('/coordinator/employees/delete-users', isAuthCoord, userController.deleteUsers)
.post('/coordinator/employees/modify-users', isAuthCoord, userController.modifyUsers)

// Ruta /coordinator/orders
.get('/coordinator/orders', isAuthCoord, ordersController.main)

module.exports = router;