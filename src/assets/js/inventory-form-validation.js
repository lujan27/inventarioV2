let pkg = [{}],
    mode, pathTo;

const checkInputs = () => {
    $('form.form-user .form-control').on('change', (e) => {
        const tgt = e.target;

        if(tgt.dataset.old != tgt.value)
            return $(tgt).addClass('modified');
        return $(tgt).removeClass('modified');
    })
}

/**
 * Función para validación del formulario y guardado
 * temporal de datos.
 */
const sendForm = () => {
    let indexRow = 0, lock = true;
    pkg = [{}];

    $('form.form-user .form-control').map((i, element) => {
        let id = element.id,
            max, min, value,
            mandatory = $(element).hasClass('mandatory'),
            modified = $(element).hasClass('modified');

        if (mode == 'edit') {
            if (!('content' in pkg[indexRow])) pkg[indexRow]['content'] = {}
            pkg[indexRow]['_id'] = $('form.form-user #user-id').val();
        }

        switch (element.tagName) {
            case 'INPUT':
                if (element.type == 'text' || 'email' || 'password') {
                    max = element.maxLength || 50;
                    min = (element.minLength == -1) ? 2 : element.minLength;
                    value = element.value.trim().length;
                } else if (element.type == 'number') {
                    max = element.max || 10;
                    min = element.min || 0;
                    value = parseInt(element.value);
                }

                if (value >= min && value <= max && ((mandatory && modified) || modified)) {
                    $(element).removeClass('is-invalid');
                    $(element).addClass('is-valid');
                    if (mode == 'edit')
                        pkg[indexRow]['content'][id] = (element.type == 'number') ? value : element.value.trim();
                    else
                        pkg[indexRow][id] = (element.type == 'number') ? value : element.value.trim();
                } else {
                    $(element).addClass('is-invalid');
                    $(element).removeClass('is-valid');
                    lock = false;
                }
                break;
            case 'SELECT':
                if (element.value != '0'  && ((mandatory && modified) || modified)) {
                    $(element).removeClass('is-invalid');
                    $(element).addClass('is-valid');
                    if (mode == 'edit')
                        pkg[indexRow]['content'][id] = element.value;
                    else
                        pkg[indexRow][id] = element.value;
                } else {
                    $(element).addClass('is-invalid');
                    $(element).removeClass('is-valid');
                    lock = false;
                }
                break;
        }
    });

    if (lock) $('#btn-modal-confirm')[0].click()
}

const fillUsers = (e) => {
    const tgt = e.target;
    let id = tgt.dataset.id;

    emptyForm();

    // Ocultar elementos de registro y establecer modo edición
    mode = 'edit';
    pathTo = '/modify-users';
    $('#modal-user .mode-e').removeClass('d-none');
    $('#modal-user .mode-r, #modal-user #password + label i').addClass('d-none');
    $('#modal-user #password').removeClass('mandatory');
    
    
    // Rellenar input
    $('#modal-user #user-id').val(id);
    $('#modal-user input:not([type="hidden"])').map((i, element) => {
        let objective = element.id,
            value = $(`tr#id-${id} .${objective}`);
        element.value = (value.length) ? value[0].innerHTML.trim() : '';
        element.dataset.old = element.value;
    });
    
    // Auto select
    $('#modal-user select').map((i, element) => {
        let objective = element.id,
            value = $(`tr#id-${id} .${objective}`);
        if (value.length) {
            let option = element.querySelectorAll(`option[value="${value[0].innerHTML.trim()}"]`);
            if (option) {
                option[0].selected = true;
                element.querySelectorAll(`option[selected]`).selected = false;
            }
        }
        element.dataset.old = element.value;
    });
}

const emptyForm = (e) => {
    pkg = [{}];

    $('#modal-user .form-control').map((i, element) => {
        if (element.tagName == 'INPUT')
            element.value = '';
        else if (element.tagName == 'SELECT') {
            element.querySelectorAll('option[selected]').selected = false;
            element.querySelectorAll('option[value="0"]').selected = true;
        }
        
        if ('old' in element.dataset)
            delete element.dataset.old;
        
        $(element).removeClass('is-valid is-invalid');
    });
}

const deleteUsers = (e) => {
    const tgt = e.target;
    let index = 0
    pkg = [{}];

    if (!('id' in tgt.dataset)) return;

    mode = 'delete';
    pathTo = '/delete-users';
    pkg[index]['_id'] = tgt.dataset.id;
    $('#modal-confirm .mode-reg').addClass('d-none');
    $('#modal-confirm .mode-del').removeClass('d-none');
}

const registerUsers = (e) => {
    pkg = [{}];
    mode = 'register';
    pathTo = '/add-users';

    $('#modal-confirm .mode-reg').removeClass('d-none');
    $('#modal-confirm .mode-del').addClass('d-none');
}

const joinWindowPath = (path) => {
    let newPath = window.location.href,
        l = newPath.length;

    if (newPath[l - 1] == '/')
        newPath = newPath.slice(0, l - 1);
    if (path[0] != '/')
        path = '/' + path;

    return newPath + path
}

/**
 * Función general para envió de datos AJAX
 * @param {*} e 
 */
const confirmAction = (e) => {
    $.ajax({
        type: 'POST',
        url: joinWindowPath(pathTo),
        contentType: 'application/json', // Important thing don't delete 💀
        dataType: 'json', // Also this is important 👻
        data: JSON.stringify({ users: pkg }),
        async: true,
        /** _--* Parámetros útiles 101 *--_
         * result: resultado 👁👄👁
         * xhr: headers
         * error: causa del error
        */
        success: (result, status, xhr) => {
            console.log(result);
        },
        error: (xhr, status, error) => {
            console.error(xhr);
            console.error(error);
        },
        complete: () => {
            // Si hay actualización asincronía de la tabla
            // $('#modal-user .close-modal').click();
            // mode = null;
            // pathTo = null;
            // pkg = [{}];
            window.location.reload();
        }
    });
}

$(document).ready(() => {
    checkInputs();
    
    $('button.register-mode').on('click', registerUsers); // Botón de edición de usuario
    $('button.edit-mode').on('click', fillUsers); // Botón de edición de usuario
    $('button.delete-mode').on('click', deleteUsers); // Botón de baja de usuario

    $('button.btn-confirm').on('click', confirmAction); // Botón para confirmar
    
    $('#modal-user .submit-data').on('click', sendForm);
    $('#btn-confirm').on('click', confirmAction);

    $('button.close-modal').on('click', emptyForm);
})