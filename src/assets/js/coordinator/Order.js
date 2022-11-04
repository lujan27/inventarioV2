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
    const productName = $(`.product-name[data-id="${itemID}"]`)[0].innerText; //Obtienes el nombre de la tabla
    const unit = $(`.product-unit[data-id="${itemID}"]`)[0].innerText; //Obtienes la unidad de la tabla
    const des = $(`.product-description[data-id="${itemID}"]`)[0].innerText;
    const button = document.getElementById('Gdisabled');    

    // Si no existe, añádelo
    if (!$(`#formOrder .row[data-id="${itemID}"]`).length)
        formOrder.append(`
            <div class="row order-item" data-id="${itemID}">
            <h4>Pedido <strong>${productName}</strong></h4>
                <div class="col-4 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-name"
                            type="text" placeholder="." value="${productName.trim()}" name="pdOrd" readonly/>
                        <label>
                            Nombre:
                        </label>
                    </div>
                </div>

                <div class="col-4 col-lg-2 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-qty"
                            type="number" placeholder="." value="0" min="0" max="9999" name="qntyOrd"/>
                        <label>
                            Cantidad:
                        </label>
                    </div>
                </div>

                <div class="col-4 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-unit"
                            type="text" placeholder="." value="${unit.trim()}" name="unitOrd" readonly/>
                        <label>
                            Unidad de medida:
                        </label>
                    </div>
                </div>

                <div class="col-6 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-des"
                            type="text" placeholder="." value="${des.trim()}" name="desOrd" readonly/>
                        <label>
                            Descripción:
                        </label>
                    </div>
                </div>

                <div class="col-6 col-lg-5 m-auto py-2">
                    <div class="form-floating">
                        <textarea class="form-control prod-notes"
                            cols="30" rows="10" name="noteOrd"></textarea>
                        <label>
                            Notas / Comentarios:
                        </label>
                    </div>
                </div>
            </div>
        `);

        if(productName){
            button.removeAttribute('disabled', 'disabled');
        }
}

if (buttonsOrder.length)
    buttonsOrder.on('click', createOrder);

// $('#Gdisabled').on('click', (e) => {
//     var items = [];
//     var status = document.getElementById('role').value.trim();
//     $('.order-item').map((i, elem) => {
//         var quantity = parseInt(elem.querySelector('.prod-qty').value),
//             product = elem.querySelector('.prod-name').value.trim(),
//             notes = elem.querySelector('.prod-notes').value.trim(),
//             order = {}
        
//         if (quantity > 0) {
//             order = {
//                 pdOrd: product,
//                 qntyOrd: quantity,
//                 status
//             }
//             if (notes.length > 1){
//                 order.noteOrd = notes;
//             }
//             if(status == 'usuario'){
//                 order.status = 'Solicitado';
//             }
//             else if(status == 'coordinador'){
//                 order.status = 'Pendiente revisión';
//             }
            
//         }

//         items.push(order);
        
//     });


    


//     $.ajax({
//         type: 'POST',
//         url: window.location.origin + '/add-order',
//         contentType: 'application/json', // Important thing don't delete 💀
//         dataType: 'json', // Also this is important 👻
//         data: JSON.stringify({ items: items, module: 'Usuario' }),
//         async: true,
//         /** _--* Parámetros útiles 101 *--_
//          * result: resultado 👁👄👁
//          * xhr: headers
//          * error: causa del error
//         */
//         success: (result, status, xhr) => {
//             window.location.reload();
//         },
//         error: (xhr, status, error) => {
//             console.error(xhr);
//             console.error(error);
//         }
//     });
// })







