const createOrder = (id, item) => {
    // Añade el articulo al inicio de la lista
    $('#formOrder').prepend(`
        <div class="row order-item" data-id="${id}">
            <div class="col-3 col-xl-3 mx-auto py-2 ps-4 pe-1">
                <div class="form-floating">
                    <input class="form-control prod-name"
                        type="text" placeholder="." value="${item.name.trim()}" name="pdOrd" readonly/>
                    <label>
                        Nombre
                    </label>
                </div>
            </div>

            <div class="col-3 col-xl-2 mx-auto py-2 px-1">
                <div class="form-floating">
                    <input class="form-control prod-qty"
                        type="number" placeholder="." value="0" min="0" max="${item.quantity}" name="qntyOrd"/>
                    <label>
                        Cantidad (${item.unit.trim()})
                    </label>
                </div>
            </div>

            <div class="col-5 col-xl-7 mx-auto py-2 px-lg-4 px-1">
                <div class="form-floating">
                    <textarea class="form-control prod-notes"
                        cols="30" rows="10" name="noteOrd"></textarea>
                    <label>
                        Notas / Comentarios
                    </label>
                </div>
            </div>
        </div>
    `);
}

const addItemToOrder = (e) => {
    const tgt = e.target;
    const id = e.target.dataset.id;

    // Si no existe, añádelo
    if (!$(`#formOrder .row[data-id="${id}"]`).length)
        $.ajax({
            type: 'GET',
            url: `${window.location.origin}/get-stock-item/${id}`,
            contentType: 'application/json', // Important thing don't delete 💀
            async: true,
            /** _--* Parámetros útiles 101 *--_
             * result: resultado 👁👄👁
             * xhr: headers
             * error: causa del error
            */
            success: (result, status, xhr) => {
                result = JSON.parse(result)
                createOrder(id, result.item);
                $('#orderNow').removeClass('d-none');
            },
            error: (xhr, status, error) => {
                console.error(xhr);
                console.error(error);
                $('body').append(`<div class="header alert alert-danger alert-dismissible">
                        No se pudo agregar articulo. Contacte con el administrador
                        <a href="#" class="close" data-dismiss="alert" aria-label="close">x</a>
                    </div>`)
                setTimeout(() => {
                    if($('.alert:first').length)
                        $('.alert:first').remove()
                }, 2500)
            }
        });
}

$('#orderNow').on('click', (e) => {
    var items = [];

    $('.order-item').map((i, elem) => {
        var quantity = parseInt(elem.querySelector('.prod-qty').value),
            product = elem.querySelector('.prod-name').value.trim(),
            notes = elem.querySelector('.prod-notes').value.trim(),
            order = {}
        
        if (quantity > 0) {
            order = {
                pdOrd: product,
                qntyOrd: quantity
            }
            if (notes.length > 1)
                order.noteOrd = notes;
        }

        items.push(order);
    });

    $.ajax({
        type: 'POST',
        url: window.location.origin + '/add-order',
        contentType: 'application/json', // Important thing don't delete 💀
        dataType: 'json', // Also this is important 👻
        data: JSON.stringify({ items: items, module: 'Usuario' }),
        async: true,
        /** _--* Parámetros útiles 101 *--_
         * result: resultado 👁👄👁
         * xhr: headers
         * error: causa del error
        */
        success: (result, status, xhr) => {
            window.location.reload();
        },
        error: (xhr, status, error) => {
            console.error(xhr);
            console.error(error);
        }
    });
})

$(document).ready(() => {
    $('button.btnAddItem').on('click', addItemToOrder); // Botón de edición de usuario
})