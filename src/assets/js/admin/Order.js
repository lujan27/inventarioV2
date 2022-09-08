let buttonsOrder = $('.btnOrder');

const createOrder = (e) => {
    const itemID = e.target.dataset.id;
    const formOrder = $('#formOrder'); //Obtienes el div del formulario
    const productName = $(`.product-name[data-id="${itemID}"]`)[0]; //Obtienes los valores de la tabla

    // Si no existe, añádelo
    if (!$(`#formOrder .row[data-id="${itemID}"]`).length)
        formOrder.append(`
            <div class="row" data-id="${itemID}">
                <div class="col-4 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-name" id="prod-name-${itemID}"
                            type="text" placeholder="." value="${productName.textContent}" name="pdOrd" readonly/>
                        <label for="prod-name-${itemID}">
                            Nombre
                        </label>
                    </div>
                </div>

                <div class="col-3 col-lg-2 m-auto py-2">
                    <div class="form-floating">
                        <input class="form-control prod-qty" id="prod-qty-${itemID}"
                            type="number" placeholder="." value="0" min="0" max="9999" name="qntyOrd"/>
                        <label for="prod-qty-${itemID}">
                            Cantidad
                        </label>
                    </div>
                </div>

                <div class="col-4 col-lg-5 m-auto py-2">
                    <div class="form-floating">
                        <textarea class="form-control prod-notes" id="prod-notes-${itemID}"
                            cols="30" rows="10" name="noteOrd"></textarea>
                        <label for="prod-notes-${itemID}">
                            Notas / Comentarios
                        </label>
                    </div>
                </div>
            </div>
        `);
        
}

if (buttonsOrder.length)
    buttonsOrder.on('click', createOrder);
