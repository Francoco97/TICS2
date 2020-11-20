const mongoose = require('mongoose');
const { Schema } = mongoose;

const detalle_venta = new mongoose.Schema({
  numero_venta: {type: Number, require: true},
  cod_prod: {type: Number, require: true},
  valor_prod: {type: Number, require: true}
  { collection : 'detalle_venta'}
);

module.exports = mongoose.model('Detalle_venta', detalle_venta);
