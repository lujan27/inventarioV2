const express = require('express');
const router = express.Router();
const User = require('../models/users/userModel');
const Ranch = require('../models/ranchModel');
const Stock = require('../models/stockModel');
const MainCat = require('../models/mainCatalogueModel');
const encryption = require('../controllers/encryptionController');
const {isAuthAdmin} = require('../config/sessionAdmin');

// Main view of admin
router.get('/admin', isAuthAdmin, async(req, res) => {
    const success_msg = req.flash('success_msg');
    const error = req.flash('error');
    const ranches = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const usuarios = await User.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    const stockPrin = await Stock.aggregate([
        {
            '$match': {
                'ranch_owner': 'Rancho Principal'
            }
        }
    ]);

    res.render('admin/adminHome',{
        doc_title: 'Administrador',
        usuarios,
        ranches,
        stockPrin
    });
});

// Route for info users
// router.get('/admin/infoUser/:id', async(req, res)=>{
//     const user = await User.findById(req.params._id);
//     console.log(user);
//     res.render('admin/infoUser' , {
//         doc_title: 'Administrador', 
//         edit
//     });

// });

// Route for edit users
router.get('/admin/editUser/:id', isAuthAdmin, async(req, res)=>{
    const ranches = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const usuarios = await User.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    const stockPrin = await Stock.aggregate([
        {
            '$match': {
                'ranch_owner': 'Rancho Principal'
            }
        }
    ]);

    const edit = await User.findById(req.params.id);
    console.log(edit);
    res.render('admin/editUser' , {
        doc_title: 'Administrador', 
        edit,
        usuarios,
        ranches,
        stockPrin
    });

});

//Ruta vista Home Grafias estadisticas
router.get('/homeGraphics', async(req, res)=>{
    res.render('admin/homeGraphics' , {
        doc_title: 'Administrador'
    });

});

//Ruta vista info del usuario
router.get('/infoUser/:id', async(req, res)=>{
        const user = await User.findById(req.params.id);
        console.log(user);
        res.render('admin/infoUser' , {
            doc_title: 'Administrador', 
            user
        });
    });


// Route type PUT for edit users
router.put('/admin/editUser/:id', isAuthAdmin, async(req, res)=>{
    var {name, lastname, username, email, password, role, ranch} = req.body;
    password = await encryption.encryptPassword(password);
    await User.findByIdAndUpdate(req.params.id, {name, lastname, username, email, password, role, ranch});
    req.flash('success_msg', 'Usuario Actualizado');
    res.redirect('/admin');
});

// Route for delete users
router.delete('/admin/deleteuser/:id', isAuthAdmin, async(req, res)=>{
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Usuario Eliminado');
    res.redirect('/admin');
});

// Route for view of each ranch by id
router.get('/admin/ranches/:id', isAuthAdmin, async(req, res) => {
    const ranches = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const ranchesid = await Ranch.findById(req.params.id);

    const stockid = await Stock.aggregate([
        {
            '$match': {
                'ranch_owner': ranchesid.ranch_name
            }
        }
    ]);

    //console.log(stockid);
    res.render('ranches/ranch', {
        doc_title: ranchesid.ranch_name,
        ranchesid,
        ranches,
        stockid
    })
});

// View add user
router.get('/admin/addUser', isAuthAdmin, async (req, res) => {
    const RanchsBD = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    res.render('admin/addUser', {
        RanchsBD, 
        doc_title: 'Añadir Usuario'
    });
});

// Post add user
router.post('/admin/addUser', isAuthAdmin, async (req, res) => {
    console.log(req.body);
    const {name, lastname, username, email, password, role, ranch} = req.body;
    
    //const errors = [];
    if(name.length <=0){
        req.flash('danger_msg', 'Digite su nombre');
        res.redirect('/admin/addUser');
    }
    if(username.length <= 0){
        req.flash('danger_msg', 'Escriba un nombre de usuario mayor a 4 caracteres');
        res.redirect('/admin/addUser');
    }
    if(password.length < 4){
        req.flash('danger_msg', 'Digite mas de 4 caracteres para la contraseña');
        res.redirect('/admin/addUser');
    } 
    if(role.length <= 0){
        req.flash('danger_msg', 'Tiene que asignar un rol de usuario');
        res.redirect('/admin/addUser');
    }
    if(ranch.length <= 0) {
        req.flash('danger_msg', 'Tiene que asignarle un rancho al usuario');
        res.redirect('/admin/addUser');
    } else {
        const emailUser = await User.findOne({email:email}); //Search an actual email to prevent duplicate
        const uniqueUser = await User.findOne({username: username});
        if(emailUser) {
            req.flash('danger_msg', 'El correo ya esta registrado');
            res.redirect('/admin/addUser');
        }
        if(uniqueUser){
            req.flash('danger_msg', 'El usuario ya esta registrado');
            res.redirect('/admin/addUser');
        }
        
        const newUser = new User({name, lastname, username, email, password, role, ranch});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'Usuario creado!');
        res.redirect('/admin');
    }
    
});

// View add new ranch
router.get('/admin/addRanch', isAuthAdmin, async (req, res) => {
    const RanchsBD = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);

    res.render('admin/addRanch', {
        doc_title: 'Añadir Rancho',
        RanchsBD
    });
});

// Route for add a new ranch
router.post('/admin/addRanch', isAuthAdmin, async (req, res) => {
    console.log(req.body);
    const { ranch_name, location } = req.body
    if(ranch_name.length <= 3){
        req.flash('danger_msg', 'Ingrese un nombre mas largo');
        res.redirect('/addRanch');
    }

    const rancho = await Ranch.findOne({ranch_name:ranch_name});

    if(rancho){
        req.flash('danger_msg', 'El rancho ya existe');
        res.redirect('/addRanch');
    } else {
        const newRanch = new Ranch({ranch_name, location});
        await newRanch.save();
        req.flash('success_msg', 'Rancho creado!');
        res.redirect('/admin');
    }
});



// View for all users on the system
router.get('/admin/allUsers', isAuthAdmin, async (req, res) => {
    const ranches = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);

    const usuarios = await User.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    res.render('admin/allUsers', {
        doc_title: 'Usuarios',
        ranches,
        usuarios
    });
});

// view add stock
router.get('/admin/addStock', isAuthAdmin, async (req, res) => {
    const RanchsBD = await Ranch.find();

    res.render('admin/addStock', {
        doc_title: 'Añadir Stock',
        RanchsBD
    });
});

// post add stock
router.post('/admin/addStock', isAuthAdmin, async (req, res) => {
    console.log(req.body);
    const {ranch_owner, name_materiaPrima, description_materiaPrima, quantity, unidad_medida} = req.body

    const newStock = new Stock({ranch_owner, name_materiaPrima, description_materiaPrima, quantity, unidad_medida});
    await newStock.save();
    req.flash('success_msg', 'Stock registrado!');
    res.redirect('/admin');
});

// view add main catalogue
router.get('/admin/mainCatalogue', isAuthAdmin, async (req, res) => {
    const RanchsBD = await Ranch.find();

    res.render('admin/mainCatalogue', {
        doc_title: 'Main catalogue',
        RanchsBD
    });
})

// post main catalogue
router.post('/admin/addmaincatalogue', isAuthAdmin, async (req, res) => {
    const {nameProduct, descriptionProduct} = req.body;

    const catalogue = await MainCat.findOne({nameProduct: nameProduct});

    if(catalogue){
        req.flash('danger_msg', 'El producto ya existe');
        res.redirect('/admin/mainCatalogue');
    } else {
        const newCatalogue = new MainCat({nameProduct, descriptionProduct});
        await newCatalogue.save();
        req.flash('success_msg', 'Producto agregado al catalogo');
        res.redirect('/admin/mainCatalogue');
    }
});


module.exports = router;