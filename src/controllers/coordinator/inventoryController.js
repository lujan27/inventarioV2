// const inventoryModel = require('../../models/coordinator/inventoryModel');
const inventoryModel = require('../../models/stockModel');

function main (req, res) {
    let data = null;

    // const foo = require('../orderController');
    // foo.main();

    inventoryModel.aggregate([
        {
          '$match': {
            'ranch_owner': req.user.ranch
          }
        }
      ])
    .then((result) => {
        data = result;
    })
    .catch(error => {
        console.error(error);
        data = false;
    })
    .finally(() => {
        return res.render('coordinator/index', {
            doc_title: 'Coordinador',
            data: data,
        });
    });
}

/**
 * Función asíncrona para obtener registros de inventario.
 * La función podrá recibir strings de IDs en un array y se
 * obtendrán de "ids". La variable "showHidden" booleana se
 * usa para mostrar registros "eliminados".
 * Para uso en backend se tendrá que declarar la variable "local"
 * en el cuerpo de la solicitud para devolver los datos sin 
 * respuesta HTML.
 * @param {Array} req.body.ids 
 * @param {Boolean} req.body.pass 
 * @param {Boolean} req.body.showHidden 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
 function getItems (req, res) {
    let find = { 'display': {'$ne': false} };
    
    if (req.body.ids) find['_id'] = req.body.ids;
    if (req.body.showHidden) delete find['display'];

    return inventoryModel.find(find, project)
    .then(data => {
        if(req.body.local) return Promise.resolve(data);
        return res.status(200).send(JSON.stringify({
            response: true,
            data: data
        }));
    })
    .catch(error => {
        if(req.body.local) return Promise.reject(error);
        return res.status(200).send(JSON.stringify({
            response: false,
            error: error
        }));
    })
}

/**
 * Función asíncrona para añadir artículos.
 * Aceptara un array de objetos, cada uno deberá contener
 * claves llamadas 'name'(String), 'description'(String)
 * 'quantity'(Number) y 'unit'(String).
 * @param {*} req 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
function addItems (req, res) {
    let items = req.body.items

    if (items.length) {
        return inventoryModel.aggregate([
            { $sort: { _id: -1 } },
            { $limit: 1 },
            { $project: { _id: 1 } }
        ])
        .then(result => {
            let _id = (result.length) ? parseInt(result[0]._id) : 0;

            items.forEach((item, i) => {
                if (Object.keys(item).length === 0)
                    delete items[i];
                else
                    item._id = _id + i + 1;
            });

            return inventoryModel.insertMany(items)
            .then(() => {
                return res.send(JSON.stringify({
                    response: true
                }))
            })
            .catch(error => {
                console.error(error);
                return res.send(JSON.stringify({
                    response: false,
                    error: error
                }))
            });
        })
        .catch(error => {
            console.error(error);
            return res.send(JSON.stringify({
                response: false,
                error: error
            }))
        });
    } else return res.send(JSON.stringify({
        response: false,
        error: 'Without data to insert' // Conflict
    }));
}

/**
 * Función asíncrona para "eliminar" artículos.
 * Aceptara un array de objetos, cada uno deberá contener
 * claves '_id' refiriéndose a numero identificador y 
 * 'delete' con valor booleano para elegir la operación.
 * @param {*} req 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
function deleteItems (req, res) {
    let items = req.body.items;

    if (items.length) {
        return items.forEach(item => {
            let operation = (item.delete) ? { display: false } : { display: true };
        
            inventoryModel.updateOne({ _id: item._id }, { $set: operation })
            .then(() => {
                return res.send(JSON.stringify({
                    response: true
                }));
            })
            .catch((error) => {
                return res.send(JSON.stringify({
                    response: false,
                    error: error
                }));
            });
        })
    } else return res.send(JSON.stringify({
        response: false,
        error: 'Without data to insert' // Conflict
    }));
}

/**
 * Función asíncrona para modificar artículos.
 * Aceptara un array de objetos, cada uno deberá contener
 * claves '_id' refiriéndose a numero identificador y 
 * 'content' que contendrá un objeto con las posibles
 * claves que se pueden modificar:
 * 'name'(String), 'description'(String), 'quantity'(Number),
 * 'unit'(String) y/o 'display'(Boolean).
 * @param {*} req 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
function modifyItems (req, res) {
    let items = req.body.items;
    
    if (items.length) {
        items.forEach(item => {
            return inventoryModel.updateOne({ _id: item._id }, { $set: item.content })
            .then(() => {
                return res.send(JSON.stringify({
                    response: true
                }));
            })
            .catch((error) => {
                return res.send(JSON.stringify({
                    response: false,
                    error: error
                }));
            });
        });
    } else return res.send(JSON.stringify({
        response: false,
        error: 'Without data to insert' // Conflict
    }));
}

module.exports = {
    main,
    getItems,
    addItems,
    deleteItems,
    modifyItems,
};