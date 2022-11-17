const chemicalModel = require("../models/chemicalModel");
const ranchModel = require("../models/ranchModel");

const moment = require('moment-timezone');

const utilCtrl = {}

utilCtrl.getChemicals = async (req, res) => {
    const quimicos = await chemicalModel.find();

    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);

    res.render('util/chemicals', {
        doc_title: 'Agroquimicos',
        quimicos,
        ranches
    })
}

utilCtrl.getAddChemical = async (req, res) => {
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);

    res.render('util/addchemicals', {
        doc_title: 'Agregar Agroquimico',
        ranches
    })
}

utilCtrl.newChemical = async (req, res) => {
    const {chemical_name, category, lote, quantity, created, caducity} = req.body;    
    
    let limit = moment.tz(caducity, 'America/Mexico_City');
    let creation = moment.tz(created, 'America/Mexico_City');
    console.log(limit)

    const newChemical = chemicalModel({
        chemical_name,
        category,
        lote,
        quantity,
        created: creation,
        caducity: limit
    })
    await newChemical.save();
    req.flash('success_msg', 'Agroquimico registrado');
    res.redirect('/agroquimicos');
    console.log(req.body)
}

utilCtrl.getEditChemical = async (req, res) => {
    const ranches = await ranchModel.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const quimicos = await chemicalModel.findById(req.params.id)

    res.render('util/editchemical', {
        doc_title: 'Editar agroquimico',
        ranches,
        quimicos
    })

}

utilCtrl.editChemical = async (req, res) => {
    const {chemical_name, category, lote, quantity, created, caducity} = req.body;

    let limit = moment.tz(caducity, 'America/Mexico_City');
    let creation = moment.tz(created, 'America/Mexico_City');

    await chemicalModel.findByIdAndUpdate(req.params.id,{
        chemical_name,
        category,
        lote,
        quantity,
        created: creation,
        caducity: limit
    })
    req.flash('success_msg', 'Producto actualizado!')
    res.redirect('/agroquimicos')

}

utilCtrl.deleteChemical = async (req, res) => {
    await chemicalModel.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Agroquimico eliminado!')
    res.redirect('/agroquimicos')
}

module.exports = utilCtrl;