const usersModel = require('../../models/userModel');

function main (req, res) {
    let data = null;

    //  Encontrar usuarios del mismo rancho si es
    // coordinador, si es admin mostrar todos 
     
    usersModel.find({}) 
    .then((result) => {
        data = result;
    })
    .catch(error => {
        console.error(error);
        data = false;
    })
    .finally(() => {
        return res.render('coordinator/users', {
            doc_title: 'Coordinador - Empleados',
            data: data,
        });
    });
}

/**
 * Función asíncrona para añadir artículos.
 * Aceptara un array de objetos, cada uno deberá contener
 * claves llamadas 'firstname'(String), 'lastname'(String),
 * 'username'(String), 'email'(String), 'password'(String),
 * 'role'(String) y 'ranch'(String).
 * @param {*} req 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
 function addUsers (req, res) {
    let users = req.body.users

    if (users.length) {
        return usersModel.aggregate([
            { $sort: { _id: -1 } },
            { $limit: 1 },
            { $project: { _id: 1 } }
        ])
        .then(result => {
            let _id = (result.length) ? parseInt(result[0]._id) : 0;

            users.forEach((item, i) => {
                if (Object.keys(item).length === 0)
                    delete users[i];
                else
                    item._id = _id + i + 1;
            });

            return usersModel.insertMany(users)
            .then(() => {
                return res.status(200).send(JSON.stringify({
                    response: true
                }))
            })
            .catch(error => {
                console.error(error);
                return res.status(500).send(JSON.stringify({
                    response: false,
                    error: error
                }))
            });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send(JSON.stringify({
                response: false,
                error: error
            }))
        });
    } else return res.status(500).send(JSON.stringify({
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
function deleteUsers (req, res) {
    let users = req.body.users;

    if (users.length) {
        return users.forEach(item => {
            let operation = (item.delete) ? { display: false } : { display: true };
        
            usersModel.updateOne({ _id: item._id }, { $set: operation })
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
function modifyUsers (req, res) {
    let users = req.body.users;
    
    if (users.length) {
        users.forEach(item => {
            return usersModel.updateOne({ _id: item._id }, { $set: item.content })
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
}