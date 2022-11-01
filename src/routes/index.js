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
const stockModel = require('../models/stockModel');
const userModel = require('../models/users/userModel');

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
    const ranches = await Ranch.find();
    const catalogue = await MainCat.find();

    res.render('admin/catalogue', {
        doc_title: 'Catalogo principal',
        ranches,
        catalogue
    });
});

router.post('/add-order', async (req, res) => {
    
    const data = req.body;
    let cont = [];
    for (let element in data.pdOrd){
        
        cont.push(element);

    };

    console.log('Cantidad de ordenes: ' + cont.length);

    var estatus="";

    switch(req.user.role){
        case "coordinador":
            estatus = "Pendiente a revisión"
            break;

        case "usuario":
            estatus = "Solicitado"    
            break;
        
        case "administrador":
            estatus = "En camino"
            break;        
    }
    
    const {module, pdOrd, qntyOrd, noteOrd, unitOrd, desOrd} = req.body;

    if(qntyOrd <= 0 && module == 'Catalogo principal') {
            req.flash('danger_msg', 'La cantidad no puede ser 0');
            res.redirect('/catalogue');
        } else if (qntyOrd <= 0 && module == 'Administrador') {
            req.flash('danger_msg', 'La cantidad no puede ser 0');
            res.redirect('/coordinator');
        } else if (qntyOrd <= 0 && module == 'Coordinador') {
            req.flash('danger_msg', 'La cantidad no puede ser 0');
            res.redirect('/coordinator');
        } else if (qntyOrd <= 0 && module == 'Usuario'){
            req.flash('danger_msg', 'La cantidad no puede ser 0');
            res.redirect('/user')
        }
            if(noteOrd == '' && module == 'Catalogo principal') {
                req.flash('danger_msg', 'Debe especificar la nota de su petición');
                res.redirect('/catalogue');
            } else if (noteOrd == '' && module == 'Administrador') {
                req.flash('danger_msg', 'Debe especificar la nota de su petición');
                res.redirect('/coordinator');
            } else if (noteOrd == '' && module == 'Coordinador') {
                req.flash('danger_msg', 'Debe especificar la nota de su petición');
                res.redirect('/coordinator');
            } else if (noteOrd == '' && module == 'Usuario'){
                req.flash('danger_msg', 'Debe especificar la nota de su petición');
                res.redirect('/user')
            } else {                

                if(typeof pdOrd == "string" && req.user.role == 'administrador'){

                    const one = new ordersModel({
                        module, 
                        pdOrd, 
                        qntyOrd, 
                        noteOrd, 
                        userOrder: req.user.username, 
                        userRanch: req.user.ranch, 
                        status: estatus, 
                        unit: unitOrd
                    });
                       await one.save();
                       req.flash("success_msg", "Orden creada!");
                       
                 } else if(typeof pdOrd == 'string') {
                    //Realizar la consulta en el stock del rancho principal
                    const query = await stockModel.findOne({
                        ranch_owner: 'Rancho Principal',
                        name: pdOrd
                    });

                    console.log(query);
                    
                    //Verificar si existe el producto solicitado y si hay suficiente stock para realizar la orden
                    if(query == null){
                        //console.log('No existe el material');
                        
                        req.flash('danger_msg', 'No existe '+pdOrd+ ' en el Rancho Principal, contacte a su supervisor');                

                    } else if(Number(qntyOrd) > query.quantity){
                        //console.log('No hay suficiente material');
                        req.flash('danger_msg', 'No hay suficiente cantidad en el rancho principal, contacte a su supervisor');
                                                
                    } else if(pdOrd == query.name && Number(qntyOrd) <= query.quantity){
                        //console.log('Existe el material y se puede realizar la orden');
                        const oneOrder = new ordersModel({
                            module, 
                            pdOrd, 
                            qntyOrd, 
                            noteOrd, 
                            userOrder: req.user.username, 
                            userRanch: req.user.ranch, 
                            status: estatus, 
                            unit: unitOrd,
                            description: desOrd
                        });
                           await oneOrder.save();
                           req.flash("success_msg", "Orden creada!");
                    } else {
                        req.flash('danger_msg', 'Ha ocurrido un error, contacte a soporte');                                            
                    }
                 }else {

                    let errors = [];
                    let errorsQnty = [];
                     for(let i=0; i<cont.length; i++){

                        let multi_query = await stockModel.findOne({
                            ranch_owner: 'Rancho Principal',
                            name: pdOrd[i]
                        });

                        if(multi_query == null){
                            errors.push(pdOrd[i]);
                        }
                        // console.log(multi_query);
                        // console.log('Esto tiene qntyOrd: '+ qntyOrd[i]);
                        // console.log('Esto tiene multi_query: '+ multi_query.quantity);
                        else if(Number(qntyOrd[i]) > Number(multi_query.quantity)){
                            errorsQnty.push(pdOrd[i]);
                        }
                        //console.log('Esto tiene la consulta: '+ multi_query.name);
                         
                     }
                     console.log('Esto tiene errores: '+errors);
                     console.log('Esto tiene errorsQnty:'+errorsQnty);
                    //  console.log(errors.length);
                     if(errors.length >= 1){
                        req.flash('danger_msg', 'No hay estos materiales: '+errors+' .Contacte a su supervisor');
                     } else if(errorsQnty.length >= 1){
                        req.flash('danger_msg', 'No hay suficiente material en: '+errorsQnty+' .Contacte a su supervisor');
                     } else {
                        for(let j = 0; j<cont.length; j++){
                            let two = new ordersModel({
                                module, pdOrd:pdOrd[j], 
                                qntyOrd:qntyOrd[j], 
                                noteOrd:noteOrd[j], 
                                userOrder: req.user.username, 
                                userRanch: req.user.ranch, 
                                status: estatus, 
                                unit: unitOrd[j],
                                description: desOrd[j]
                            });
                            await two.save();
                        }

                        req.flash("success_msg", "Ordenes creadas: "+cont.length);
                     }
                     
                    
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
                    
                    case "Administrador":
                        res.redirect('/admin')
                        break;
                 }
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
    console.log(req.body);
    var {newStatus, reasons, reqName, reqQuantity, reqUser, reqRanch, reqUnit, reqDes} = req.body;
    var updStatus = '';

    if(reasons == ''){
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

        console.log(updStatus);

        if(updStatus == 'Pendiente a revisión'){
            await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, reasonsCoord: reasons, statusCoord: req.user.username});
            req.flash('success_msg', 'Estatus actualizado: ' + updStatus);
            res.redirect('/orders-done');
        } else if(updStatus == 'Rechazada' && req.user.role == 'coordinador'){
            await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, reasonsCoord: reasons, statusCoord: req.user.username});
            req.flash('danger_msg', 'Estatus actualizado: ' + updStatus);
            res.redirect('/orders-done');
        } else if(updStatus == 'Rechazada' && req.user.role == 'administrador'){
            await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, reasonsAdmin: reasons, statusAdmin: req.user.username});
            req.flash('danger_msg', 'Estatus actualizado por administrador: ' + updStatus);
            res.redirect('/orders-done');
        } else {

            if(updStatus == 'Aceptada' && reqRanch == 'Rancho Principal'){
                const stockPrin = await stockModel.findOne({ //Obtiene el stock del 'Rancho Principal'
                    ranch_owner: 'Rancho Principal', 
                    name: reqName
                });

                if(stockPrin == null){
                    const newStock = new stockModel({
                        ranch_owner: reqRanch,
                        name: reqName,
                        description: reqDes,
                        quantity: reqQuantity,
                        unit: reqUnit
                    });

                    await newStock.save();
                    await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, reasonsAdmin: reasons, statusAdmin: req.user.username});
                    req.flash('success_msg', 'Stock registrado');
                    res.redirect('/orders-done');
                } else {
                    var actual_qnty = Number(stockPrin.quantity)
                    var req_qnty = Number(reqQuantity);
                    var new_quantity = actual_qnty + req_qnty;
                    console.log('Se actualiza desde admin:' + new_quantity);

                    await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, reasonsAdmin: reasons, statusAdmin: req.user.username});
                    await stockPrin.updateOne({quantity: new_quantity});
                    req.flash('success_msg', 'Stock actualizado');
                    res.redirect('/orders-done');
                }
                
                
            }

            else if(updStatus == 'Aceptada'){
                const stockP = await stockModel.findOne({ //Obtiene el stock del 'Rancho Principal'
                    ranch_owner: 'Rancho Principal', 
                    name: reqName
                });
    
                if(stockP == null){
                    req.flash('danger_msg', 'Este material no existe en el rancho');
                    res.redirect('/orders-done');
                } else {
                    var o_quantity = Number(stockP.quantity); //Cantidad actual en el 'Rancho principal'
                    var n_quantity = Number(reqQuantity); //Cantidad solicitada en la orden
                    var result = o_quantity - n_quantity; //Calcula la resta del inventario y la orden requerida
                    console.log(o_quantity);
                    console.log('El resultado es: '+result);
        
                    if(result > o_quantity || Math.sign(result) == -1){
                        req.flash('danger_msg', 'No hay el material suficiente');
                        res.redirect('/orders-done');
                    } else{
                        const stockTarget = await stockModel.findOne({
                            ranch_owner: reqRanch,
                            name: reqName
                        });
            
                        if(stockTarget == null){//
                            var c_quantity = 0;
                        } else {
                            var c_quantity = Number(stockTarget.quantity); //Cantidad dentro del rancho destino
                        }
            
                        var update_qnty = c_quantity + n_quantity; //Operacion para la suma de material
                        
                        if(stockTarget == null){ //En caso de que el material que solicitan no exista se creará cuando el admin lo acepte
                            console.log('No existe ese material');
                            const newStock = new stockModel({
                                ranch_owner: reqRanch,
                                name: reqName,
                                quantity: reqQuantity,
                                unit: reqUnit,
                                description: reqDes
                            })
                            await newStock.save();
                            await stockP.updateOne({quantity: result});// Actualiza el stock del 'Rancho Principal'
            
                            const sent_Uses = new usesModel({ //Registrar el uso del material
                                ranch_owner: 'Rancho Principal',
                                name: reqName,
                                description: reqDes,
                                unit: reqUnit,
                                old_quantity: o_quantity,
                                registered_qnty: n_quantity,
                                new_quantity: result,
                                user: req.user.username,
                                type_action: 'Transferencia de material para: '+reqRanch
                            });
                            await sent_Uses.save();
            
                            const receipt_Uses = new usesModel({
                                ranch_owner: reqRanch,
                                name: reqName,
                                description: reqDes,
                                unit: reqUnit,
                                old_quantity: c_quantity,
                                registered_qnty: n_quantity,
                                new_quantity: update_qnty,
                                user: req.user.username,
                                type_action: 'Recibo de material desde Rancho Principal'
                            });
                            await receipt_Uses.save();
            
                        } else {
                            
                            console.log('La nueva cantidad esssss: '+update_qnty)
                            await stockTarget.updateOne({quantity: update_qnty})
                            await stockP.updateOne({quantity: result});
            
                            const sent_Uses = new usesModel({ //Registrar el envio del material
                                ranch_owner: 'Rancho Principal',
                                name: reqName,
                                description: reqDes,
                                unit: reqUnit,
                                old_quantity: o_quantity,
                                registered_qnty: n_quantity,
                                new_quantity: result,
                                user: req.user.username,
                                type_action: 'Transferencia de material para: '+reqRanch
                            });
                            await sent_Uses.save();
            
                            const receipt_Uses = new usesModel({
                                ranch_owner: reqRanch,
                                name: reqName,
                                description: reqDes,
                                unit: reqUnit,
                                old_quantity: c_quantity,
                                registered_qnty: n_quantity,
                                new_quantity: update_qnty,
                                user: req.user.username,
                                type_action: 'Recibo de material desde Rancho Principal'
                            });
                            await receipt_Uses.save();
                        }
                        
                        await ordersModel.findByIdAndUpdate(req.params.id, {status: updStatus, reasonsAdmin: reasons, statusAdmin: req.user.username});
        
                        if(updStatus == 'Aceptada' ){
                            req.flash('success_msg', 'Estatus actualizado: ' + updStatus + '\n');
                            req.flash('success_msg', 'Transferencia de material realizada');
                        }
                        
                        res.redirect('/orders-done');
                    }
                }
                
            }
        }


        
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
    const newUses = new usesModel({
        ranch_owner, 
        name, 
        description, 
        unit, 
        old_quantity: c_stock.quantity, 
        registered_qnty: quantity, 
        new_quantity: total_quantity, 
        user: req.user.username, 
        type_action: 'Uso de material'
    });
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
    const ranches = await Ranch.find();
    switch(req.user.role){
        case 'administrador':
            const ordersAdmin = await Order.aggregate([
                {
                    '$match': {
                        'status': {'$ne': 'Solicitado'}
                    }
                    
                },
                {
                    '$match': {
                        'status': {'$ne':'Rechazada'}
                    }
                },
                {
                    '$sort': {
                        '_id':-1
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
                    'userRanch': req.user.ranch,
                    'userOrder': req.user.username
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
        ordersH,
        ranches
    });

});

router.get('/uses-historic', async (req, res) => {
    const ranches = await Ranch.find();
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
        uses,
        ranches
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