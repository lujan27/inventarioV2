const countOrdersCtrl = {}

const ordersModel = require('../../models/ordersModel');

countOrdersCtrl.orders = async (req, res) =>{
    const contCoord = await ordersModel.aggregate([
    {
      '$match': {
        'status': {
          '$ne': 'Pendiente a revisión'
        }
      }
    }, {
      '$match': {
        'userRanch': req.user.ranch
      }
    },
    {
      '$count': 'status'
    }
  ]);   
}

module.exports = countOrdersCtrl