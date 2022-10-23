const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash/lib/flash');
const Order = require('../models/ordersModel');
const Ranch = require('../models/ranchModel');
const MainCat = require('../models/mainCatalogueModel');
const stock = require('../models/stockModel');
const usesModel = require('../models/usesModel');
const {isAuthLogged} = require('../config/sessionOn');
const ordersModel = require('../models/ordersModel');

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

router.post('/add-order', async (req, res) => {
    
    const data = req.body;
    let cont = [];
    for (let element in data.pdOrd){
        
        cont.push(element);

    };

    console.log(cont.length);

    var estatus="";

    switch(req.user.role){
        case "coordinador":
            estatus = "Pendiente a revisión"
            break;

        case "usuario":
            estatus = "Solicitado"    
            break;

        
        
    }
    
    const {module, pdOrd, qntyOrd, noteOrd} = req.body;

    if(typeof pdOrd == "string"){
       const one = new ordersModel({module, pdOrd, qntyOrd, noteOrd, userOrder: req.user.username, userRanch: req.user.ranch, status: estatus});
       await one.save();
       req.flash("success_msg", "Orden creada!");
       
    }else{

        for(let i=0; i<cont.length; i++){
            let two = new ordersModel({module, pdOrd:pdOrd[i], qntyOrd:qntyOrd[i], noteOrd:noteOrd[i], userOrder: req.user.username, userRanch: req.user.ranch, status: estatus});
            await two.save();
            
        }
        req.flash("success_msg", "Ordenes creadas: "+cont.length);
       
    }

    switch(module){
         
        case "Catalogo principal":
            res.redirect('/catalogue')
            break;

        case "Coordinador":
            res.redirect('/coordinator')
            break;

        case "Usuario":
            res.redirect('/user')
            break;

        
        
    }
});

router.get('/orders-done/:id', async (req, res) => {
    const orderid = await Order.findById(req.params.id);
    //console.log(orderid.items.length);
    res.render('orderID', {
        doc_title: 'Informacion del pedido',
        orderid
    });
});

// Route for edit users
// router.get('/user/editstatus/:id', async(req, res)=>{
//     const editstatus = await ordersModel.findById(req.params.id);
//     console.log(editstatus);
//     res.render('editstatus' , {
//         doc_title: 'Editar estatus',
//         editstatus
//     });

// });

// Route type PUT for edit STATUS
router.put('/editstatus/:id', async(req, res)=>{
    // var {status} = req.body;
    // await ordersModel.findByIdAndUpdate(req.params.id, {status});
    // req.flash('success_msg', 'Estatus actualizado');
    // res.redirect('/user');
    console.log(req.body);
    var {newStatus, declineReasons} = req.body;
    var updStatus = '';

    // switch(req.user.role && newStatus){
    //     case 'administrador' && 'Aceptar':
    //         newStatus = 'Aceptada'
    //         break;
    //     case 'administrador' && 'Rechazar':
    //         newStatus = 'Rechazada'
    //         break;
    //     case 'coordinador' && 'Aceptar':
    //         console.log('Pendiente');
    //         // newStatus = 'Pendiente a revisión'
    //         break;
    //     case 'coordinador' && 'Rechazar':
    //         newStatus = 'Rechazada'
    //         break;
    // }
    if(declineReasons == ''){
        req.flash('danger_msg', 'Tiene que ingresar las razones del rechazo de la orden');
        res.redirect('/orders-done');
    } else{

        if(req.user.role == 'administrador' && newStatus == 'Aceptar'){
            updStatus = 'Aceptada';
        } else if (req.user.role == 'coordinador' && newStatus == 'Aceptar'){        
            updStatus = 'Pendiente a revisión';
        } else {
            updStatus = 'Rechazada';
        }
        await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, declineReasons});
        if(updStatus == 'Aceptada' || updStatus == 'Pendiente a revisión'){
            req.flash('success_msg', 'Estatus actualizado: ' + updStatus);
        } else if(updStatus == 'Rechazada'){
            req.flash('danger_msg', 'Estatus actualizado: ' + updStatus);
        }
        
        res.redirect('/orders-done');
    }
});


//Ruta para material gastado
router.get('/uses/:id', async (req, res) => {
    
    const uso = await stock.findById(req.params.id);
    // console.log(uso);

    res.render('uses', {
        doc_title: 'Uso de material',
        uso
    });
});

router.put('/uses/:id', async (req, res) => {
    //console.log(req.body);
    const {ranch_owner, name, description, unit, quantity} = req.body;
    const c_stock = await stock.findById(req.params.id);
    const c_quantity = Number(c_stock.quantity);
    const n_quantity = Number(quantity);
    
    if(n_quantity > c_quantity){
        req.flash('danger_msg', 'La nueva cantidad no puede ser mayor al stock actual')
    }
    const total_quantity = c_quantity - n_quantity;
    await stock.findByIdAndUpdate(req.params.id, {ranch_owner, name, description, unit, quantity: total_quantity});
    const newUses = new usesModel({ranch_owner, name, description, unit, old_quantity: c_stock.quantity, registered_qnty: quantity, new_quantity: total_quantity, user: req.user.username});
    await newUses.save();
    req.flash('success_msg', 'Stock actualizado');
    switch(req.user.role){
        case 'usuario':
            res.redirect('/user');
        break;
        case 'coordinador':
            res.redirect('/coordinator');
        break;
    }
    
    
});

//Ruta vista Historial
router.get('/orders-done', async(req, res)=>{
    
    switch(req.user.role){
        case 'administrador':
            const ordersAdmin = await Order.aggregate([
                {
                    '$match': {
                        'status': {$ne: 'Solicitado'}
                    }
                }
            ])

            ordersH = ordersAdmin
            break;
        case 'coordinador':
            const ordersCoord = await Order.aggregate([
                {
                    '$match': {
                        'userRanch': req.user.ranch
                    }
                }
            ]);

            ordersH= ordersCoord;
            break;
        case 'usuario':
            const ordersUser = await Order.aggregate([
                {
                  '$match': {
                    'userRanch': req.user.ranch
                  }
                }
            ]);
            
            ordersH = ordersUser;
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

router.get('/uses-historic', async (req, res) => {

    const uses = await usesModel.aggregate([
        {
          '$match': {
            'ranch_owner': req.user.ranch
          }
        }
      ]);
    // console.log(uses);

    res.render('uses-historic', {
        doc_title: 'Historial Material',
        uses
    });
});

// router.put('/update/:id', async(req, res)=>{
//     console.log("HERE I AM");
//     var {status} = req.body;
    //console.log(req.body);
    // var okok = await Order.findById(req.params.id);
    /*for (i=0; i<okok.items.length;i++){

    }*/
    // console.log(okok.items[0].status)
    
    // await Order.findByIdAndUpdate(req.params.id, {$set:{"items.status.$[0]": {status}}},{new:true})
    // .then(()=>{
    //     console.log("aqui")
        
    // }).catch(e=>console.log(e))

    //req.flash('success_msg', 'Status Actualizado');
        //res.redirect('/orders-done');
// });

module.exports = router;