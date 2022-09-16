// Archivo para rutas útiles pero que no entran las rutas de categoría

const { Router } = require('express');
const { isAuthCoord } = require('../config/sessionCoord');
const router = Router();

const ordersController = require('../controllers/ordersController');

router

.get('/get-stock-item/:_id', isAuthCoord, ordersController.getStockItem)

module.exports = router;