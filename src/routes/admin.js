const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Ranch = require('../models/ranchModel');
const Stock = require('../models/stockModel');

router.get('/admin', async(req, res) => {
    const success_msg = req.flash('success_msg');
    const error = req.flash('error');
    const ranches = await Ranch.find();
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
    //console.log(JSON.stringify(usuarios));
    console.log(usuarios);
    res.render('admin/adminhome',{
        doc_title: 'Administrador',  usuarios, ranches
    });
})


//Rutas para la vista del administrador
// router.get('/admin/user/userhome', (req, res) => {
//     res.render('user/userhome')
// });

router.get('/admin/ranchos/:id', async(req, res) => {
    const usuarios = await User.find();
    const ranches = await Ranch.find();
    const ranchesid = await Ranch.findById(req.params.id);
    res.render('ranchos/rancho', {doc_title: ranchesid.ranch_name, ranchesid, ranches, usuarios})
});
// View add user
router.get('/admin/adduser', async (req, res) => {
    const RanchsBD = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    res.render('admin/adduser', {
        RanchsBD, 
        doc_title: 'Añadir Usuario'
    });
});

// Post add user
router.post('/admin/adduser', async (req, res) => {
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
        const emailUser = await User.findOne({email:email}); //Search an actual email to prevent duplicate
        const uniqueUser = await User.findOne({username: username});
        if(emailUser) {
            req.flash('danger_msg', 'El correo ya esta registrado');
            res.redirect('/admin/adduser');
        }
        if(uniqueUser){
            req.flash('danger_msg', 'El usuario ya esta registrado');
            res.redirect('/admin/adduser');
        }
        
            const newUser = new User({name, lastname, username, email, password, role, ranch});
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success_msg', 'Usuario creado!');
            res.redirect('/admin');
    }
    
});

// view add new ranch
router.get('/admin/addranch', (req, res) => {
    res.render('admin/addranch', {
        doc_title: 'Añadir Rancho'
    });
});

router.post('/admin/addranch', async (req, res) => {
    console.log(req.body);
    const { ranch_name, location } = req.body
    if(ranch_name.length <= 3){

        req.flash('danger_msg', 'Ingrese un nombre mas largo');
        res.redirect('/addranch');
        
    }

    const rancho = await Ranch.findOne({ranch_name:ranch_name});

    if(rancho){
        req.flash('danger_msg', 'El rancho ya existe');
        res.redirect('/addranch');
    } else {
            const newRanch = new Ranch({ranch_name, location});
            await newRanch.save();
            req.flash('success_msg', 'Rancho creado!');
            res.redirect('/admin');

    }

    
});

router.get('/admin/addstock', async (req, res) => {
    const RanchsBD = await Ranch.find();

    res.render('admin/addstock', {
        doc_title: 'Añadir Stock',
        RanchsBD
    });
});

router.post('/admin/addstock', async (req, res) => {
    console.log(req.body);
    const {ranch_owner, name_materiaPrima, description_materiaPrima, quantity, unidad_medida} = req.body

    const newStock = new Stock({ranch_owner, name_materiaPrima, description_materiaPrima, quantity, unidad_medida});
    await newStock.save();
    req.flash('success_msg', 'Stock registrado!');
    res.redirect('/admin');
});

module.exports = router;