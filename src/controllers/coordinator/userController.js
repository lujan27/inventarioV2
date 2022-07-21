const usersModel = require('../../models/users/userModel');
const encryption = require('../encryptionController');

function main (req, res) {
    let users = null;
    //  Encontrar usuarios del mismo rancho si es
    // coordinador, si es admin mostrar todos 
    getUsers({body: { local: true }})
    .then((data) => {
        users = data;
    })
    .catch(error => {
        console.error(error);
        users = false;
    })
    .finally(() => {
        return res.render('coordinator/users', {
            doc_title: 'Coordinador - Empleados',
            data: users,
        });
    });
}

/**
 * Función asíncrona para obtener usuarios.
 * La función podrá recibir strings de IDs en un array y se
 * obtendrán de "ids". Se mostrara la contraseña declarando
 * la variable "pass" con valor "true" en la solicitud.
 * La variable "showHidden" booleana se usa para mostrar registros
 * "eliminados".
 * Para uso en backend se tendrá que declarar la variable "local"
 * en el cuerpo de la solicitud para devolver los datos sin 
 * respuesta HTML.
 * @param {Array} req.body.ids 
 * @param {Boolean} req.body.pass 
 * @param {Boolean} req.body.showHidden 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
function getUsers (req, res) {
    let find = { 'display': {'$ne': false} }
    let project = (req.body.pass) ? {} : { 'password': false }
    
    if (req.body.ids) find['_id'] = req.body.ids;
    if (req.body.showHidden) delete find['display'];

    return usersModel.find(find, project)
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
        users.forEach(async user => {
            const {name, lastname, username, email, password, role, ranch} = user;

            if (name.length <=0){
                req.flash('danger_msg', 'Digite su nombre');
                return res.redirect('/coordinator/users');
            }
            if (username.length <= 0){
                req.flash('danger_msg', 'Escriba un nombre de usuario mayor a 4 caracteres');
                return res.redirect('/coordinator/users');
            }
            if (password.length < 4){
                req.flash('danger_msg', 'Digite mas de 4 caracteres para la contraseña');
                return res.redirect('/coordinator/users');
            } 
            if (role.length <= 0){
                req.flash('danger_msg', 'Tiene que asignar un rol de usuario');
                return res.redirect('/coordinator/users');
            }
            if (ranch.length <= 0) {
                req.flash('danger_msg', 'Tiene que asignarle un rancho al usuario');
                return res.redirect('/coordinator/users');
            }

            const emailUser = await usersModel.findOne({email: email}); //Search an actual email to prevent duplicate
            const uniqueUser = await usersModel.findOne({username: username});

            if(emailUser) {
                req.flash('danger_msg', 'El correo ya esta registrado');
                return res.redirect('/coordinator/users');
            }
            if(uniqueUser){
                req.flash('danger_msg', 'El usuario ya esta registrado');
                return res.redirect('/coordinator/users');
            }
            
            const newUser = new usersModel({name, lastname, username, email, password, role, ranch});
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save()
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
        });
    } else return res.status(500).send(JSON.stringify({
        response: false,
        error: 'Without data to insert' // Conflict
    }));
}

/**
 * Función asíncrona para "eliminar" artículos.
 * Aceptara un array de objetos, cada uno deberá contener
 * claves '_id' refiriéndose a numero identificador.
 * @param {*} req 
 * @param {*} res 
 * @returns Devuelve una respuesta HTTP con 'true' o 'false'
 */
function deleteUsers (req, res) {
    let users = req.body.users;

    if (users.length) {
        return users.forEach(async (user) => {        
            return await usersModel.updateOne({ _id: user._id }, { $set: { display: false } })
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

    if (!users) return res.status(403).send(JSON.stringify({
        response: false,
        error: 'Without data to insert' // Conflict
    }));
    
    if (users.length) {
        users.forEach(async (user) => {
            if ('password' in user.content)
                user.content.password = await encryption.encryptPassword(user.content.password)

            return await usersModel.updateOne({ _id: user._id }, { $set: user.content })
            .then(() => {
                // Quizá remplace flash por notificaciones funcionales con AJAX
                req.flash('success_msg', 'Se ha guardado correctamente la información');
                return res.status(200).send(JSON.stringify({
                    response: true
                }));
            })
            .catch((error) => {
                req.flash('danger_msg', 'No se ha podido guardar la información');
                return res.status(500).send(JSON.stringify({
                    response: false,
                    error: error
                }));
            });
        });
    } else return res.status(403).send(JSON.stringify({
        response: false,
        error: 'Without data to insert' // Conflict
    }));
}

module.exports = {
    main,
    getUsers,
    addUsers,
    deleteUsers,
    modifyUsers
}