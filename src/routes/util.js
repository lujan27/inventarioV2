// Archivo para rutas útiles pero que no entran las rutas de categoría

const { Router } = require('express');
const { isAuthCoord } = require('../config/sessionCoord');
const {isAuthAdmin} = require('../config/sessionAdmin');
const router = Router();

const ordersController = require('../controllers/ordersController');

const utilCtrl = require('../controllers/utilCtrl');

router

.get('/get-stock-item/:_id', isAuthCoord, ordersController.getStockItem)

.get('/agroquimicos', isAuthAdmin, utilCtrl.getChemicals)

.get('/addchemical', isAuthAdmin, utilCtrl.getAddChemical)

.post('/addchemical', utilCtrl.newChemical)

.get('/editchemical/:id', isAuthAdmin, utilCtrl.getEditChemical)

.put('/editchemical/:id', utilCtrl.editChemical)

.delete('/deletechemical/:id', utilCtrl.deleteChemical)

module.exports = router;