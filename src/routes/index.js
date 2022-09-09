const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash/lib/flash');
const Order = require('../models/ordersModel');
const Ranch = require('../models/ranchModel');
const MainCat = require('../models/mainCatalogueModel');
const {isAuthLogged} = require('../config/sessionOn');

//Cerrar sesión
router.get('/admin/Cerrar', async (req, res)=>{
    req.session.destroy();
    res.redirect('/');
    
});

router.get('/', (req, res) => {
    const success_msg = req.flash('success_msg')[0];
    res.render('index', {
        doc_title: 'Inicio de sesión - Inventario',
    });
})

router.post('/', passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
}), (req, res) => {
    switch(req.user.role){
        case 'administrador':
            res.redirect('/admin');
            break;
        case 'coordinador':
            res.redirect('/coordinator');
            break;
        case 'usuario':
            res.redirect('/user');
            break;
        default: 
            res.redirect('/');
            break;
    }
    
});

// view Order Main Catalogue
router.get('/catalogue', async (req, res) => {
    const RanchsBD = await Ranch.find();
    const catalogue = await MainCat.find();

    res.render('admin/catalogue', {
        doc_title: 'Catalogo principal',
        RanchsBD,
        catalogue
    });
});

router.post('/addorder', async (req, res) => {
    const {pdOrd, qntyOrd, noteOrd, module} = req.body;
    const items = pdOrd.forEach((elem, i) => {
        return {
            pdOrd: elem,
            qntyOrd: qntyOrd[i],
            noteOrd: noteOrd[i]
        }
    });

    switch(req.user.role){
        case 'administrador':
            status = 'Aprobado'
            break;
        case 'coordinador':
            status = 'Pendiente revisión'
            break;
        case 'usuario':
            status = 'Solicitado'
            break;
        default: 
            status = 'En proceso'
            break;
    }
    
    const userOrder = req.user.username;
    const userRanch = req.user.ranch;

    const newOrder = new Order({
        items, 
        status,
        module,
        userOrder,
        userRanch
    });

    await newOrder.save();

    req.flash('success_msg', 'Peticion realizada');

    switch (module){
        case 'Administrador':
            res.redirect('/admin');
            break;
        case 'Catalogo Principal':
            res.redirect('/catalogue');
            break;
        case 'Usuario':
            res.redirect('/user');
            break;
        default: 
            res.redirect('/catalogue');
            break;
    } //Agregar mas case para redirigir a los usuarios dependiendo del nombre que tenga su pagina de pedidos
    
});

//Ruta vista Historial
router.get('/ordersDone', async(req, res)=>{
    
    switch(req.user.role){
        case 'administrador':
            ordersH = await Order.find();
            break;
        case 'coordinador':
            status = 'Pendiente revisión'
            break;
        case 'usuario':
            status = 'Solicitado'
            break;
        default: 
            status = 'En proceso'
            break;
    }

    res.render('historic' , {
        doc_title: 'Pedidos Realizados',
        ordersH
    });

});

module.exports = router;