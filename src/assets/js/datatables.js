$(document).ready(() => {
    const columnOrderable = (selector) => {
        let order = $(selector).data('column-orderable');
        let res = [];

        if (order) order = order.split(',');
        
        order.forEach(element => {
            if (element.trim() == '1')
                return res.push(null);
            return res.push({ orderable: false });
        });

        return res;
    }

    if ($('.data-table').length) {
        $('.data-table').DataTable({
            // data: [
            //    { ... }, {
            //        "Nombre":    "name",
            //        "Usuario":   "user",
            //        "E-mail":    "email@mail.com"
            //    }, { ... }
            // ],
            // columns: [
            //     { data: 'Nombre' },
            //     { data: 'Usuario' },
            //     { data: 'E-mail' }
            // ]
            dom: '<"top"f>Brt<"bottom"p>',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i>',
                    titleAttr: 'Exportar a Excel',
                    className: 'btn btn-success'
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i>',
                    titleAttr: 'Exportar a PDF',
                    className: 'btn btn-danger'
                },
                {
                    extend: 'print',
                    text: '<i class="fa fa-print"></i>',
                    titleAttr: 'Imprimir',
                    className: 'btn btn-info'
                }
            ],
            responsive: true,
            order: [[0, 'desc']],
            columns: columnOrderable('.data-table'),
            language: {
                "emptyTable":     "No se encontraron registros",
                "info":           "Mostrando _START_ a _END_ de _TOTAL_ registros",
                "infoEmpty":      "Mostrando 0 a 0 de 0 registros",
                "infoFiltered":   "(filtrados de _MAX_ registros totales)",
                "thousands":      ",",
                "lengthMenu":     "Mostrando _MENU_ registros",
                "loadingRecords": "Cargando...",
                "search":         "",
                "zeroRecords":    "No se encontraron resultados en la búsqueda",
                "paginate": {
                    "first":      "Primero",
                    "last":       "Ultimo",
                    "next":       ">",
                    "previous":   "<"
                },
                "aria": {
                    "sortAscending":  ": activar para ordenar la columna de forma ascendente",
                    "sortDescending": ": activar para ordenar la columna de forma descendente"
                }
            }
        });

        $('#inventoryTable.data-table tbody').on('click', 'tr', () => {
            $(this).toggleClass('selected');
        });
    
        $('#button-test').click(() => {
            alert(table.rows('.selected').data().length + ' row(s) selected');
        });
    }
});