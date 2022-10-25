function changeStatus(){
    var sel = document.getElementById('status');//Selecciona el select
    var selected = sel.options[sel.selectedIndex];//Obten el valor de la opcion seleccionada
    console.log(selected.value);
    var btn = document.getElementById('Gdisabled');//Selecciona el boton
    label = document.getElementById('lbldecline');
    salto = document.getElementById('salto');
    txtArea = document.getElementById('decline');

    if(selected.value == 'Aceptar'){
        txtArea.setAttribute('disabled', 'disabled');
    }

    if(selected.value != 'No'){
        btn.removeAttribute('disabled', 'disabled');//Quita el atributo disabled del elemento
        label.setAttribute('hidden', 'hidden');
        txtArea.setAttribute('hidden', 'hidden');
        salto.setAttribute('hidden', 'hidden');
        if(selected.value == 'Rechazar'){
            label.removeAttribute('hidden', 'hidden');
            txtArea.removeAttribute('hidden', 'hidden');
            salto.removeAttribute('hidden', 'hidden');
            txtArea.removeAttribute('disabled', 'disabled');

        }
    } else if (selected.value == 'No'){
        btn.setAttribute('disabled', 'disabled');//Agrega el atributo disabled del elemento
        label.setAttribute('hidden', 'hidden');
        txtArea.setAttribute('hidden', 'hidden');
        salto.setAttribute('hidden', 'hidden');
    }
}