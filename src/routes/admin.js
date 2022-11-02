const express = require('express');
const router = express.Router();
const userModel = require('../models/users/userModel');
const ranchModel = require('../models/ranchModel');
const stockModel = require('../models/stockModel');
const mainCatModel = require('../models/mainCatalogueModel');
const encryption = require('../controllers/encryptionController');
const {isAuthAdmin} = require('../config/sessionAdmin');
const {isAuthLogged} = require('../config/sessionOn');

// Main view of admin
router.get('/admin', isAuthAdmin, async(req, res) => {
    const success_msg = req.flash('success_msg');
    const error = req.flash('error');
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const usuarios = await userModel.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    const stockPrin = await stockModel.aggregate([
        {
            '$match': {
                'ranch_owner': 'Rancho Principal'
            }
        }
    ]);

    res.render('admin/adminhome',{
        doc_title: 'Administrador',
        usuarios,
        ranches,
        stockPrin
    });
});

// Route for info users
// router.get('/admin/infouser/:id', async(req, res)=>{
//     const user = await userModel.findById(req.params._id);
//     console.log(user);
//     res.render('admin/infouser' , {
//         doc_title: 'Administrador', 
//         edit
//     });

// });

// Route for edit users
router.get('/admin/edituser/:id', isAuthAdmin, async(req, res)=>{
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const usuarios = await userModel.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    const stockPrin = await stockModel.aggregate([
        {
            '$match': {
                'ranch_owner': 'Rancho Principal'
            }
        }
    ]);

    const edit = await userModel.findById(req.params.id);
    console.log(edit);
    res.render('admin/edituser' , {
        doc_title: 'Administrador', 
        edit,
        usuarios,
        ranches,
        stockPrin
    });

});

//Ruta vista Home Grafias estadisticas
router.get('/HomeGraphics', async(req, res)=>{
    res.render('admin/HomeGraphics' , {
        doc_title: 'Administrador'
    });

});

//Ruta vista info del usuario
router.get('/infouser/:id', isAuthLogged, async(req, res)=>{
        const ranches = await ranchModel.find();
        const user = await userModel.findById(req.params.id);
        res.render('admin/infouser' , {
            doc_title: 'Información del usuario', 
            user,
            ranches
        });
    });


// Route type PUT for edit users
router.put('/admin/edituser/:id', isAuthAdmin, async(req, res)=>{
    var {name, lastname, username, email, password, role, ranch} = req.body;
    if(role == ''){
        req.flash('danger_msg', 'Tiene que asignar un rol');
        res.redirect('/admin/allusers');
    } else if(ranch == ''){
        req.flash('danger_msg', 'Tiene que asignar un recinto');
        res.redirect('/admin/allusers');
    } else {
        password = await encryption.encryptPassword(password);
        await userModel.findByIdAndUpdate(req.params.id, {name, lastname, username, email, password, role, ranch});
        req.flash('success_msg', 'Usuario Actualizado');
        res.redirect('/admin/allusers');
    }

});

// Route for delete users
router.delete('/admin/deleteuser/:id', isAuthAdmin, async(req, res)=>{
    await userModel.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Usuario Eliminado');
    res.redirect('/admin');
});

// Route for view of each ranch by id
router.get('/admin/ranchos/:id', isAuthAdmin, async(req, res) => {
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const ranchesid = await ranchModel.findById(req.params.id);

    const stockid = await stockModel.aggregate([
        {
            '$match': {
                'ranch_owner': ranchesid.ranch_name
            }
        }
    ]);

    //console.log(stockid);
    res.render('ranchos/rancho', {
        doc_title: ranchesid.ranch_name,
        ranchesid,
        ranches,
        stockid
    })
});

// View add user
router.get('/admin/adduser', isAuthAdmin, async (req, res) => {
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    res.render('admin/adduser', {
        ranches, 
        doc_title: 'Añadir Usuario'
    });
});

// Post add user
router.post('/admin/adduser', isAuthAdmin, async (req, res) => {
    console.log(req.body);
    const {name, lastname, username, email, password, role, ranch} = req.body;
    
    //const errors = [];
    if(name.length <=0){
        req.flash('danger_msg', 'Digite su nombre');
        res.redirect('/admin/adduser');
    }
    if(username.length <= 0){
        req.flash('danger_msg', 'Escriba un nombre de usuario mayor a 4 caracteres');
        res.redirect('/admin/adduser');
    }
    if(password.length < 4){
        req.flash('danger_msg', 'Digite mas de 4 caracteres para la contraseña');
        res.redirect('/admin/adduser');
    } 
    if(role.length <= 0){
        req.flash('danger_msg', 'Tiene que asignar un rol de usuario');
        res.redirect('/admin/adduser');
    }
    if(ranch.length <= 0) {
        req.flash('danger_msg', 'Tiene que asignarle un rancho al usuario');
        res.redirect('/admin/adduser');
    } else {
        const emailUser = await userModel.findOne({email:email}); //Search an actual email to prevent duplicate
        const uniqueUser = await userModel.findOne({username: username});
        if(emailUser) {
            req.flash('danger_msg', 'El correo ya esta registrado');
            res.redirect('/admin/adduser');
        }
        if(uniqueUser){
            req.flash('danger_msg', 'El usuario ya esta registrado');
            res.redirect('/admin/adduser');
        }
        
        const newUser = new userModel({name, lastname, username, email, password, role, ranch});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'Usuario creado!');
        res.redirect('/admin');
    }
    
});

// View add new ranch
router.get('/admin/addranch', isAuthAdmin, async (req, res) => {
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);

    res.render('admin/addranch', {
        doc_title: 'Añadir Rancho',
        ranches
    });
});

// Route for add a new ranch
router.post('/admin/addranch', isAuthAdmin, async (req, res) => {
    console.log(req.body);
    const { ranch_name, location } = req.body
    if(ranch_name.length <= 3){
        req.flash('danger_msg', 'Ingrese un nombre mas largo');
        res.redirect('/addranch');
    }

    const rancho = await ranchModel.findOne({ranch_name:ranch_name});

    if(rancho){
        req.flash('danger_msg', 'El rancho ya existe');
        res.redirect('/addranch');
    } else {
        const newRanch = new ranchModel({ranch_name, location});
        await newRanch.save();
        req.flash('success_msg', 'Rancho creado!');
        res.redirect('/admin');
    }
});



// View for all users on the system
router.get('/admin/allusers', isAuthAdmin, async (req, res) => {
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);

    const usuarios = await userModel.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    res.render('admin/allusers', {
        doc_title: 'Usuarios',
        ranches,
        usuarios
    });
});

// view add stock
router.get('/admin/addstock', isAuthAdmin, async (req, res) => {
    const ranches = await ranchModel.find();
    const catalogue = await mainCatModel.find();

    res.render('admin/addstock', {
        doc_title: 'Añadir Stock',
        ranches,
        catalogue
    });
});

// post add stock
router.post('/admin/addstock', isAuthAdmin, async (req, res) => {
    var data = req.body;

    let contar = [];
    for(let elemento in data.pdOrd){
        contar.push(elemento);
    }
    console.log(contar.length);

    console.log(req.body);
    const {ranch_owner, pdOrd, desOrd, qntyOrd, unitOrd} = req.body;

    if(ranch_owner == ''){
        req.flash('danger_msg', 'Debe seleccionar un rancho');
        res.redirect('/admin/addstock');
    } else if (qntyOrd <= 0){
        req.flash('danger_msg', 'No debe dejar en 0 la cantidad');
        res.redirect('/admin/addstock');
    } else {
        if(typeof pdOrd == 'string'){
        const newStock = new stockModel({ranch_owner, name: pdOrd, description: desOrd, quantity: qntyOrd, unit: unitOrd});
        await newStock.save();
        req.flash('success_msg', 'Stock registrado!');
        res.redirect('/admin/addstock');
    } else {
            for(let i = 0; i<contar.length; i++){
                const newStocks = new stockModel({ranch_owner, name: pdOrd[i], description: desOrd[i], quantity: qntyOrd[i], unit: unitOrd[i]});
                await newStocks.save();
            }
            req.flash('success_msg', 'Stocks registrados en '+ ranch_owner + ': '+ contar.length);
            res.redirect('/admin/addstock');
        }
    }
});

// view add main catalogue
router.get('/admin/maincatalogue', isAuthAdmin, async (req, res) => {
    const ranches = await ranchModel.find();

    res.render('admin/maincatalogue', {
        doc_title: 'Main catalogue',
        ranches
    });
})

// post main catalogue
router.post('/admin/addmaincatalogue', isAuthAdmin, async (req, res) => {
    const {nameProduct, descriptionProduct, unit} = req.body;

    const catalogue = await mainCatModel.findOne({nameProduct: nameProduct});

    if(catalogue){
        req.flash('danger_msg', 'El producto ya existe');
        res.redirect('/admin/maincatalogue');
    } else if(unit == ''){
        req.flash('danger_msg', 'Debe seleccionar una unidad de medida');
        res.redirect('/admin/maincatalogue');
    }else {
        const newCatalogue = new mainCatModel({nameProduct, descriptionProduct, unit});
        await newCatalogue.save();
        req.flash('success_msg', 'Producto agregado al catalogo');
        res.redirect('/admin/maincatalogue');
    }
});


module.exports = router;