const express = require('express');
const router = express.Router();
const User = require('../models/users/userModel');
const Ranch = require('../models/ranchModel');
const Stock = require('../models/stockModel');

router.get('/admin', async(req, res) => {
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
    //console.log(JSON.stringify(usuarios));
    //console.log(usuarios);
    console.log(stockPrin);
    res.render('admin/adminhome',{
        doc_title: 'Administrador',
        usuarios,
        ranches,
        stockPrin
    });
});


//Ruta para edicion de registros
router.get('/admin/edituser/:id', async(req, res)=>{

    const edit = await User.findById(req.params.id);
    console.log(edit);
    res.render('admin/edituser' , {doc_title: 'Administrador', edit});

});
//Ruta para edicion de registros
router.put('/admin/edituser/:id', async(req, res)=>{

    const {name, lastname, username, email, password, role, ranch} = req.body;
    await User.findByIdAndUpdate(req.params.id, {name, lastname, username, email, password, role, ranch});
    //console.log('La variable tiene', req.params.id, {name, lastname, username, email, password, role, ranch});
    req.flash('success_msg', 'Usuario Actualizado');
    res.redirect('/admin');
});

router.delete('/admin/deleteuser/:id', async(req, res)=>{

    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Usuario Eliminado');
    res.redirect('/admin');
});



//Rutas para la vista del administrador
// router.get('/admin/user/userhome', (req, res) => {
//     res.render('user/userhome')
// });

router.get('/admin/ranchos/:id', async(req, res) => {
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
    res.render('ranchos/rancho', {
        doc_title: ranchesid.ranch_name,
        ranchesid,
        ranches,
        stockid
    })
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
        doc_title: 'A??adir Usuario'
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
        req.flash('danger_msg', 'Digite mas de 4 caracteres para la contrase??a');
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
        doc_title: 'A??adir Rancho'
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
        doc_title: 'A??adir Stock',
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