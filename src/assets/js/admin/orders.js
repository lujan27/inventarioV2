let buttonsOrder = $('.btnOrder');

const joinWindowPath = (path) => {
    let newPath = window.location.href,
        l = newPath.length;

    if (newPath[l - 1] == '/')
        newPath = newPath.slice(0, l - 1);
    if (path[0] != '/')
        path = '/' + path;

    return newPath + path
}

const createOrder = (e) => {
    const itemID = e.target.dataset.id;
    const formOrder = $('#formOrder'); //Obtienes el div del formulario
    const productName = $(`.product-name[data-id="${itemID}"]`)[0].innerHTML; //Obtienes los valores de la tabla

    // Si no existe, añádelo
    if (!$(`#formOrder .row[data-id="${itemID}"]`).length)
        formOrder.append(`
            <div class="row order-item" data-id="${itemID}">
                <div class="col-4 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-name"
                            type="text" placeholder="." value="${productName.trim()}" name="pdOrd" readonly/>
                        <label>
                            Nombre
                        </label>
                    </div>
                </div>

                <div class="col-3 col-lg-2 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-qty"
                            type="number" placeholder="." value="0" min="0" max="9999" name="qntyOrd"/>
                        <label>
                            Cantidad
                        </label>
                    </div>
                </div>

                <div class="col-4 col-lg-5 m-auto py-2">
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

if (buttonsOrder.length)
    buttonsOrder.on('click', createOrder);

$('#Gdisabled').on('click', (e) => {
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