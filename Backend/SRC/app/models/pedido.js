const mongoose = require('mongoose');
const { Schema } = mongoose;

const pedido = new Schema({
  fecha: {type: Date, required: true},
  cliente : {type: String, required: true},
  sucursal : {type: String, required: true},
  descripcion: {type: String, required: true},
  estado : {type: String, required: true},
  es_venta: {type: Boolean, required: true},
  abono: {type: Number, required: true},
  total: {type: Number, required: true},
  pagos: [{type: Number, required: true}]
  },
  {collection: 'pedido'}
)

module.exports = mongoose.model('Pedido', pedido);
