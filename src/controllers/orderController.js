function main(req, res) {
    const moo = require('../models/ordersModel');
    const soo = require('../models/stockModel');
    
    soo.aggregate([
        { $match: {$text: {$search: "frijol tomate", $diacriticSensitive: false}} }
        
    ])
    .then((result) => {
        let bamboozle = {
            items: result.map((element, i) => {
                return {
                    id_item: String(element._id),
                    quantity: 0,
                    notes: 'test'
                }
            })
        }

        //console.log(bamboozle);

        new moo(bamboozle).save()
        .then((result) => {
            console.log(result);
        })
        .catch(error => {
            console.error(error);
            data = false;
        })
    })
    .catch(error => {
        console.error(error);
        data = false;
    })
}

module.exports = {
    main,
}