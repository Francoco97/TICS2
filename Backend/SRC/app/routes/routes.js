const express = require('express');
const session = require('express-session');
const router = express.Router();
const producto = require('../models/producto');
const editarProducto = require('../models/producto');
const inventario = require('../models/inventario');
const pedido = require('../models/pedido');
const registro = require('../models/registro')
const eliminarPedido = require('../models/pedido');
const crearPedido = require('../models/pedido');
const Venta = require('../models/venta');
const venta = require('../models/venta');
const crearVenta = require('../models/venta');
const empleado = require('../models/usuario');
const passport = require('../../config/passport');
const boleta = require('../models/boleta');
const eliminarBoleta = require('../models/boleta');
const detalle_venta = require('../models/detalle_venta')

router.use(passport.initialize());
router.use(passport.session());

router.get('/inicio', isLoggedIn, (req, res) => {
	let dia = dia()
	let semana = semama();
	res.json({
		dia: dia,
		semana: semana
	})
});



	function dia(){
		let fecha = Date.now();
		let dias = fecha/ (24*60*60*1000); //paso a dias
		let dia_actual = dias%1;
		let aux = dia_actual*(24*60*60*1000);
		dias = dias*(24*60*60*1000);// paso a milisegundos
		let dia_inicio = dias - aux;
		boleta.find({$and: [{fecha: {$gte: new Date(dia_inicio)}},{fecha: {$lt: new Date(dias)}}]}, (err, boleta) => {
			if(err) {
				return 0;
			}
			else{
				return boleta.length;
			}
		});
	}

	function semana(){
		let fecha = Date.now();
		let semana = 7*(24*60*60*1000);
		let dia_inicio = dias - semana;
		boleta.find({$and: [{fecha: {$gte: new Date(dia_inicio)}},{fecha: {$lt: new Date(fecha)}}]}, (err, boleta) => {
			if(err) {
				return 0;
			}
			else{
				return boleta.length;
			}
		});
	}



	////----------------------------------------------LOG IN----------------------------------------------
	router.post('/login', function (req,res) {
				passport.authenticate('local-login', function(err, user) {
				if (err) { return res.sendStatus(404); }
				if (!user) { return res.sendStatus(404); }
				console.log("Usuario recibido")

				req.logIn(user, function(err) {
					if (err) { return next(err); }
						return res.json(user)
					});
			}) (req, res);
	});


//----------------------------------------------GESTIONAR PERFIL----------------------------------------------
	router.get('/profile', isLoggedIn, (req, res) => {
		res.render('profile', {
			user: req.user
		});
	});

	// logout
	router.get('/logout', (req, res) => {
		req.logout();
		res.sendStatus(201);
	});



function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

////----------------------------------------------GESTIONAR PRODUCTOS----------------------------------------------
router.get('/productos', isLoggedIn,async function(req, res){  //lista de productos, tiene buscador
		await producto.find(function(err, producto){
	      if(err){
	         res.sendStatus(404);
	      } else {
					res.json(producto);
				}
		});
});

router.post('/productos_periodo', isLoggedIn, async function(req,res){
		const fecha1 = req.body.desde;
		const fecha2 = req.body.hasta;
		const fi = fecha1.concat("T00:00:00-04:00");
		const ff = fecha2.concat("T23:59:00-04:00");
		await producto.find({$and: [{fecha: {$gte: new Date(fi)}},{fecha: {$lt: new Date(ff)}}]}, (err, producto) => {
			if(err) {
				res.sendStatus(404);
			}
			else{
				res.json(producto);
			}
		});
});

router.post('/agregar_prod', isLoggedIn, async function(req,res){
	let fecha = Date.now();
	let codigo = req.body.codigo.toUpperCase();
	let material = req.body.material.toUpperCase();
	let tipo = req.body.tipo.toUpperCase();
	let piedra = req.body.piedra.toUpperCase();
	let precio = req.body.precio;
	let descripcion = req.body.descripcion.toUpperCase();
	let sucursal = req.body.sucursal;
  await producto.create({codigo: codigo, fecha:fecha , material: material, tipo: tipo, piedra: piedra, precio: precio, descripcion: descripcion, sucursal: sucursal}, (err) =>{
		if(!err){
     	res.sendStatus(201);
	}else{
     	res.sendStatus(404);
	}
  });
});

router.post('/editar_prod/:id', isLoggedIn, async function(req, res){
	let id = req.params.id;
	let codigo = req.body.codigo
	let material = req.body.material.toUpperCase();
	let tipo = req.body.tipo.toUpperCase();
	let piedra = req.body.piedra.toUpperCase();
	let precio = req.body.precio;
	let descripcion = req.body.descripcion.toUpperCase();
	let sucursal = req.body.sucursal;
	  await editarProducto.findByIdAndUpdate(id, {codigo: codigo, material: material, tipo: tipo, piedra: piedra, precio: precio, descripcion: descripcion, sucursal: sucursal}, async function (err) {
			await registro.create({fecha: Date.now(), tipo: 'Producto', numero: codigo, detalle: 'Se editó un producto', empleadoLog: req.user.rut, sucursal: req.user.sucursal}, function (err){
				if(!err){
					res.sendStatus(201);
				}
				else{
					 res.sendStatus(404);
				}
			})
	  });
 });

 router.post('/delete_producto/:id', isLoggedIn, async function(req,res){
    let id = req.params.id;
		await producto.findById(id, async function(err, producto){
			let codigo = producto.codigo;
			await producto.remove({_id: id}, async function(err, task){
				await registro.create({fecha: Date.now(), tipo: 'Producto', numero: codigo, detalle: 'Se eliminó un producto', empleadoLog: req.user.rut, sucursal: req.user.sucursal}, function (err){
					if(!err){
						res.sendStatus(201);
					}
					else{
						res.sendStatus(404);
					}
				})
			});
		});
});

router.post('/delete_producto_venta/:id', isLoggedIn, async function(req,res){
	 let id = req.params.id;
		 await producto.remove({_id: id}, async function(err, task){
			 if(err){
				 res.sendStatus(404);
			 }
		});
});


//----------------------------------------------GESTIONAR PEDIDOS----------------------------------------------
router.get('/pedidos', isLoggedIn, async function(req, res){  //lista de productos, tiene buscador
	 await pedido.find(function(err, pedido){
     if(err){
       res.sendStatus(404)
     } else {
				res.json(pedido)
		 }
  });
});

router.post('/pagar_pedido', isLoggedIn, async function(req,res){
	let fecha = Date.now();
	let pedido_recibido = req.body.pedido;
	let id = pedido_recibido._id;
	let numero = pedido_recibido.numero_pedido
	let cliente_nombre = pedido_recibido.cliente_nombre;
	let cliente_telefono = pedido_recibido.cliente_telefono;
	let sucursal = pedido_recibido.sucursal;
	let abono = parseInt(req.body.abono);
	let empleadoLog = req.body.empleadoLog;
	let vendedor = req.body.vendedor;
	let metodo_pago = req.body.metodo_pago;
	let descuento = 0;
	let abono_actual =  parseInt(pedido_recibido.abono);

	await empleado.findOne({'rut': vendedor}, async function(err, empleado){
		if(!empleado){
			res.sendStatus(405);
		}else{
			let nuevo_numero_pedido = numero
		 	await crearPedido.findByIdAndUpdate(id, {abono:abono_actual + abono}, (err) =>{
				if(!err){
					boleta.create({fecha: fecha, empleadoLog: empleadoLog, vendedor: vendedor, metodo_pago: metodo_pago, descuento: descuento, total: abono, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, tipo: 'Pedido', numero: nuevo_numero_pedido, vigencia: 'Vigente'}, (err) =>{
						if(!err){
							res.sendStatus(201)
						}else{
							res.sendStatus(404)
						}
					});
				}else{
					res.sendStatus(404)
				}
			});
		}
	});
});

/*router.post('/agregar_pedido', isLoggedIn, async function(req,res){
	let fecha = Date.now();
	let cliente_nombre = req.body.cliente_nombre.toUpperCase();
	let cliente_telefono = req.body.cliente_telefono.toUpperCase()
	let descripcion = req.body.descripcion.toUpperCase();
	let sucursal = req.body.sucursal;
	let estado = req.body.estado;
	let abono = req.body.abono;
	let total = req.body.total;
	let empleadoLog = req.body.empleadoLog;
	let vendedor = req.body.vendedor;
	let metodo_pago = req.body.metodo_pago;
	let descuento = req.body.descuento;

	await empleado.findOne({'rut': vendedor}, async function(err, empleado){
		if(!empleado){
			res.sendStatus(405);
		}else{
			await pedido.find({}, async function(err, pedido){
			let nuevo_numero_pedido = 1
			if( pedido.length == null || pedido.length == 0 ){
		  	await crearPedido.create({numero_pedido: nuevo_numero_pedido,fecha: fecha, sucursal: sucursal, descripcion: descripcion, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, estado: estado, abono:abono, total: total}, (err) =>{
					boleta.create({fecha: fecha, empleadoLog: empleadoLog, vendedor: vendedor, metodo_pago: metodo_pago, descuento: descuento, total: total, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, tipo: 'Pedido', numero: nuevo_numero_pedido}, (err) =>{
						if(!err){
							res.sendStatus(201)
						}else{
							res.sendStatus(404)
						}
					});
				});
			}else{
				let nuevo_numero_pedido = pedido.length + 1
				await crearPedido.create({numero_pedido: nuevo_numero_pedido, fecha: fecha, sucursal: sucursal, descripcion: descripcion, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, estado: estado, abono:abono, total: total}, (err) =>{
					if(!err){
						boleta.create({numero_pedido: nuevo_numero_pedido, fecha: fecha, empleadoLog: empleadoLog, vendedor: vendedor, metodo_pago: metodo_pago, descuento: descuento, total: total, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, tipo: 'Pedido', numero: nuevo_numero_pedido}, (err) =>{
							if(!err){
								res.sendStatus(201)
							}else{
								res.sendStatus(404)
							}
						});
					}else{
						res.sendStatus(404)
					}
				});
			}
			});
		}
	});
});*/

router.post('/agregar_pedido', isLoggedIn, async function(req,res){
	let fecha = Date.now();
	let cliente_nombre = req.body.cliente_nombre.toUpperCase();
	let cliente_telefono = req.body.cliente_telefono.toUpperCase()
	let descripcion = req.body.descripcion.toUpperCase();
	let sucursal = req.body.sucursal;
	let estado = req.body.estado;
	let total = req.body.total;
	let vendedor = req.body.vendedor;

	await empleado.findOne({'rut': vendedor}, async function(err, empleado){
		if(!empleado){
			res.sendStatus(405);
		}else{
			await pedido.find({}, async function(err, pedido){
			let nuevo_numero_pedido = 1
			if( pedido.length == null || pedido.length == 0 ){
		  	await crearPedido.create({numero_pedido: nuevo_numero_pedido,fecha: fecha, sucursal: sucursal, descripcion: descripcion, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, estado: estado, abono:0, total: total}, (err) =>{
					if(!err){
						res.sendStatus(201)
					}else{
						console.log(err)
						res.sendStatus(404)
					}
				});
			}else{
				let nuevo_numero_pedido = pedido.length + 1
				await crearPedido.create({numero_pedido: nuevo_numero_pedido, fecha: fecha, sucursal: sucursal, descripcion: descripcion, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, estado: estado, abono:0, total: total}, (err) =>{
					if(!err){
						res.sendStatus(201)
					}else{
						res.sendStatus(404)
					}
				});
			}
			});
		}
	});
});

function numero_unico_pedido(nuevo_numero){
	nuevo_numero_aux = nuevo_numero
	if(pedido.exists({numero_pedido: nuevo_numero_aux})){
		numero_unico_pedido(nuevo_numero_aux + 1)
	}else{
		return nuevo_numero_aux
	}
}

router.post('/eliminar_pedido/:id', isLoggedIn, async function(req,res){
    let id = req.params.id;
		await pedido.findById(id, async function(err, pedido){
			let numero_pedido = pedido.numero_pedido;
	    await eliminarPedido.remove({_id: id}, async function(err){
				await registro.create({fecha: Date.now(), tipo: 'Pedido', numero: numero_pedido, detalle: 'Se eliminó un pedido', empleadoLog: req.user.rut, sucursal: req.user.sucursal}, function (err){
					if(!err){
						res.sendStatus(201);
					}
					else{
						 res.sendStatus(404);
					}
				});
	    });
	});
});

router.post('/editar_pedido/:id', isLoggedIn, async function(req, res){
	let id = req.body.id;
	let fecha = req.body.fecha;
	let cliente_nombre = req.body.cliente_nombre.toUpperCase();
	let cliente_telefono = req.body.cliente_telefono;
	let sucursal = req.body.sucursal;
	let descripcion = req.body.descripcion.toUpperCase();
	let estado = req.body.estado.toUpperCase();
	let total = req.body.total;
	await pedido.findById(id, async function(err, pedido){
		let numero_pedido = pedido.numero_pedido;
		await crearPedido.findByIdAndUpdate(id,{cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, sucursal: sucursal, descripcion: descripcion, estado: estado, total: total}, async function (err) {
			if(err){
				sendStatus(404)
			}else{
				await registro.create({fecha: new Date(), tipo: 'Pedido', numero: numero_pedido, detalle: 'Se editó un pedido', empleadoLog: req.user.rut, sucursal: req.user.sucursal}, function (err){
					if(err){
						 res.sendStatus(404);
					}
				});
				res.sendStatus(201);
			}
		})
	});
});

router.post('/editar_descripcion_pedido/:id', isLoggedIn, async function(req, res){
		let fecha = req.body.fecha;
		let cliente = req.body.cliente.toUpperCase();
		let sucursal = req.body.sucursal.toUpperCase();
		let descripcion = req.body.descripcion.toUpperCase();
		let estado = req.body.estado.toUpperCase();
		let total = req.body.total;
    await pedido.findByIdAndUpdate(req.parmas.id,{cliente: cliente, sucursal: sucursal, descripción: descripcion, total: total}, function (err) {
			if(!err){
				res.sendStatus(201)
			}
			else{
				res.sendStatus(404)
		}
  });
});

router.post('/editar_estado_pedido/:id', isLoggedIn, async function(req, res){
		let fecha = req.body.fecha;
		let cliente = req.body.cliente.toUpperCase();
		let sucursal = req.body.sucursal.toUpperCase();
		let descripcion = req.body.descripcion.toUpperCase();
		let estado = req.body.estado.toUpperCase();
		let total = req.body.total;
    await pedido.findByIdAndUpdate(req.params.id,{estado: estado}, function (err) {
			if(!err){
				res.sendStatus(201)
			}
			else{
				res.sendStatus(404)
		}
  });
});

//----------------------------------------------GESTIONAR VENTAS----------------------------------------------
router.get('/lista_venta', isLoggedIn, async function(req,res){
  	await lista.find(function (err,lista) {
			if (!err){
				res.json(lista);
			}else{
				res.sendStatus(404);
			}
	});
});

router.get('/detalle_venta_dia', isLoggedIn, async function(req,res) {
	let fecha = Date.now();
	let dias = fecha/ (24*60*60*1000); //paso a dias
	let dia_actual = dias%1;
	let aux = dia_actual*(24*60*60*1000);
	dias = dias*(24*60*60*1000);// paso a milisegundos
	let dia_inicio = dias - aux;
	await detalle_venta.find({$and: [{fecha: {$gte: new Date(dia_inicio)}},{fecha: {$lt: new Date(dias)}}]}, (err, detalle_venta) => {
		if(err) {
			res.sendStatus(404);
		}
		else{
			res.json(detalle_venta);
		}
	});
});

router.post('/detalle_venta_periodo', isLoggedIn, async function(req,res){
		const fecha1 = req.body.desde;
		const fecha2 = req.body.hasta;
		const fi = fecha1.concat("T00:00:00-04:00");
		const ff = fecha2.concat("T23:59:00-04:00");
		await detalle_venta.find({$and: [{fecha: {$gte: new Date(fi)}},{fecha: {$lt: new Date(ff)}}]}, (err, detalle_venta) => {
			if(err) {
				res.sendStatus(404);
			}
			else{
				res.json(detalle_venta);
			}
		});

});

router.get('/boletasdia', isLoggedIn, async function(req,res) {
	let fecha = Date.now();
	let dias = fecha/ (24*60*60*1000); //paso a dias
	let dia_actual = dias%1;
	let aux = dia_actual*(24*60*60*1000);
	dias = dias*(24*60*60*1000);// paso a milisegundos
	let dia_inicio = dias - aux;
	await boleta.find({$and: [{fecha: {$gte: new Date(dia_inicio)}},{fecha: {$lt: new Date(dias)}}]}, (err, boleta) => {
		if(err) {
			res.sendStatus(404);
		}
		else{
			res.json(boleta);
		}
	});
});

router.post('/boletasperiodo', isLoggedIn, async function(req,res){
		const fecha1 = req.body.desde;
		const fecha2 = req.body.hasta;
		const fi = fecha1.concat("T00:00:00-04:00");
		const ff = fecha2.concat("T23:59:00-04:00");
		await boleta.find({$and: [{fecha: {$gte: new Date(fi)}},{fecha: {$lt: new Date(ff)}}]}, (err, boleta) => {
			if(err) {
				res.sendStatus(404);
			}
			else{
				res.json(boleta);
			}
		});

});

/*router.post('/crear_venta', isLoggedIn, async function(req,res){
	let prods = req.body.lista;
	let fecha = Date.now();
	let metodo_pago = req.body.metodo_pago.toUpperCase();
	let descuento = req.body.descuento;
	let sucursal = req.body.sucursal.toString();
	let vendedor = req.body.vendedor.toUpperCase();
	let total = req.body.total;
	let empleadoLog = req.body.empleadoLog;
	let cliente_nombre = req.body.cliente_nombre.toUpperCase();
	let cliente_telefono = req.body.cliente_telefono;

	await empleado.findOne({'rut': vendedor}, async function(err, empleado){
		if(!empleado){
			res.sendStatus(405);
		}else{
			await venta.find({} , async (err, venta) => {
				if( venta.length == 0 ){
					let nuevo_numero_venta = 1
					await crearVenta.create({numero_venta: nuevo_numero_venta, fecha: fecha, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, vigencia: 'Vigente'}, (err) =>{
						boleta.create({fecha: fecha, empleadoLog: empleadoLog, vendedor: vendedor, metodo_pago: metodo_pago, descuento: descuento, total: total, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, tipo: 'Venta', numero: nuevo_numero_venta, vigencia: 'Vigente'}, (err2) => {
							if(!err){
								for(i = 0; i < prods.length; i++){
									detalle_venta.create({fecha: fecha, sucursal: sucursal, numero: nuevo_numero_venta, valor_prod: prods[i].precio, cod_prod: prods[i].codigo, vigencia: 'Vigente'}, (err3) => {
										if(err){
											res.sendStatus(404)
										}
									});
								}
							}else{
								res.sendStatus(404)
							}
						});
					});
				}else if(venta.length > 0){
					let nuevo_numero_venta = venta.length + 1
					await crearVenta.create({numero_venta: nuevo_numero_venta, fecha: fecha, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, vigencia: 'Vigente'}, (err) =>{
						boleta.create({fecha: fecha, empleadoLog: empleadoLog, vendedor: vendedor, metodo_pago: metodo_pago, descuento: descuento, total: total, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, tipo: 'Venta', numero: nuevo_numero_venta, vigencia: 'Vigente'}, (err2) => {
							if(!err){
								for(i = 0; i < prods.length; i++){
									detalle_venta.create({fecha: fecha, sucursal: sucursal, numero: nuevo_numero_venta, valor_prod: prods[i].precio, cod_prod: prods[i].codigo, vigencia: 'Vigente'}, (err3) => {
										if(err){
											res.sendStatus(404)
										}
									});
								}
							res.sendStatus(201)
							}else{
								res.sendStatus(404)
							}
						});
					});
				};
			});
		};
	});
});*/

router.post('/crear_venta', isLoggedIn, async function(req,res){
	let prods = req.body.lista;
	let fecha = Date.now();
	let metodo_pago = req.body.metodo_pago.toUpperCase();
	let descuento = req.body.descuento;
	let sucursal = req.body.sucursal.toString();
	let vendedor = req.body.vendedor;
	let total = req.body.total;
	let empleadoLog = req.body.empleadoLog;
	let cliente_nombre = req.body.cliente_nombre.toUpperCase();
	let cliente_telefono = req.body.cliente_telefono;

	await empleado.findOne({'rut': vendedor}, async function(err, empleado){
		if(!empleado){
			res.sendStatus(405);
		}else{
			await venta.find({}, async function(err, venta){
				if(!err){
					let nuevo_numero_venta = venta.length + 1
					await crearVenta.create({numero_venta: nuevo_numero_venta, fecha: fecha, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, vigencia: 'Vigente'}, (err) =>{
						boleta.create({fecha: fecha, empleadoLog: empleadoLog, vendedor: vendedor, metodo_pago: metodo_pago, descuento: descuento, total: total, sucursal: sucursal, cliente_nombre: cliente_nombre, cliente_telefono: cliente_telefono, tipo: 'Venta', numero: nuevo_numero_venta, vigencia: 'Vigente'}, (err2) => {
							if(!err){
								for(i = 0; i < prods.length; i++){
									detalle_venta.create({fecha: fecha, sucursal: sucursal, numero: nuevo_numero_venta, valor_prod: prods[i].precio, cod_prod: prods[i].codigo, vigencia: 'Vigente'}, (err3) => {
										if(err){
											res.sendStatus(404)
										}
									});
								}
							res.sendStatus(201)
							}else{
								res.sendStatus(404)
							}
						});
					});
				}
			})
		};
	});
});

async function numero_unico_venta(largo){
	numero = largo
	for( i = 0; i < largo; i++){
		if(await venta.exists({numero_venta: numero}) == false){
			return numero
		}
	}
}


router.post('/eliminar_boleta/:id', isLoggedIn, async function(req,res){
    let id = req.params.id;
		boleta.findById(id, async function(err1, boleta){
			if(!err1){
				if(boleta.tipo == 'Venta'){
					let numero_venta = boleta.numero
					await eliminarBoleta.findByIdAndUpdate({_id: id}, {vigencia: 'Anulada'}, async function(err2){
						if(!err2){
							await detalle_venta.findOneAndUpdate({numero: numero_venta}, {vigencia: 'Anulada'},async function(err3){
								if(!err3){
									await venta.findOneAndUpdate({numero_venta: numero_venta}, {vigencia: 'Anulada'}, function(err4){
										if(err4){
											res.sendStatus(404)
										}
									})
								}else{
									res.sendStatus(404)
								}
							})
						}else{
							res.sendStatus(404)
						}
						res.sendStatus(201)
					})
				}else if(boleta.tipo == 'Pedido'){
					let numero_pedido = boleta.numero
					let abono_pedido = boleta.total
					await eliminarBoleta.findByIdAndUpdate({_id: id}, {vigencia: 'Anulada'}, async function(err2){
						if(!err2){
							await eliminarPedido.findOne({numero_pedido: numero_pedido}, async function(err, pedido_buscado){
								let abono_pedido_buscado = pedido_buscado.abono
								await pedido.findOneAndUpdate({numero_pedido: numero_pedido}, {abono: abono_pedido_buscado - abono_pedido }, async function(err3){
									if(err3){
										res.sendStatus(404)
									}
								})
							})
						}else{
							res.sendStatus(404)
						}
						res.sendStatus(201)
					})
				}
			}
		})
});

router.post('/anular_boleta/:id', isLoggedIn, async function(req,res){
    let id = req.params.id;
		let anular = req.params.id;
		boleta.findByIdAndUpdate(id,{anular: anular}, function(err1){
			if(!err1){
				res.sendStatus(201)
			}else{
				res.sendStatus(404)
			}
		})
});

router.post('/eliminar_venta/:id', isLoggedIn, async function(req,res){
    let id = req.params.id;
    await venta.remove({_id: id}, (err, task) =>{
			if(!err){
     		res.sendStatus(201);
			}
			else{
     		res.sendStatus(404);
			}
    });
});

//----------------------------------------------GESTIONAR EMPLEADOS----------------------------------------------
router.get('/empleados', isLoggedIn, async function(req,res){
	empleado.find({}, function(err, empleado){
		if(!err){
			res.json(empleado)
		}else{
			res.sendStatus(404)
		}
	})
});

router.post('/crear_empleado', isLoggedIn ,async function(req, res){
			await passport.authenticate('local-signup', function(err, user) {
			if (err) { return res.sendStatus(404); }
			if (!user) { return res.sendStatus(404); }
			return res.sendStatus(201); //res.sendStatus(201) para mandar 201 y res.json(user) para mandar usuari
		}) (req, res);
});

router.post('/delete_empleado/:id', isLoggedIn, async function(req,res){
    let id = req.params.id;
    await empleado.remove({_id: id}, (err) =>{
			if(!err){
     		res.sendStatus(201);
			}
			else{
     		res.sendStatus(404);
			}
	});
});


router.post('/editar_empleado/:id', async function(req, res){
	let telefono= req.body.telefono;

	let sucursal = req.body.sucursal.toUpperCase();
	await empleado.findByIdAndUpdate(req.params.id,{telefono: telefono, sucursal: sucursal}, function (err) {
		if(!err){
			res.sendStatus(201)
		}
		else{
			res.sendStatus(404)
	}
});
  });

	router.post('/editar_password/:id', async function(req, res){
		  let id = req.params.id
			let new_pass = req.body.new_pass;
	    await empleado.findById(id, function (err, empleado) {
				if(!err){
					empleado.password = empleado.generateHash(new_pass)
					empleado.save();
					res.sendStatus(201)
				}
				else{
					res.sendStatus(404)
			}
	  });
	});

	router.post('/editar_privilegios/:id',async function(req,res){
		let gestion_e = req.body.gestion_empleado;
		let gestion_i = req.body.gestion_inventario;
		let gestion_p = req.body.gestion_privilegios;
		let descuento_permitido = req.body.descuento_permitido;
		let ver_t = req.body.ver_totales;
		await empleado.findByIdAndUpdate(req.params.id,{gestion_empleado:gestion_e, gestion_inventario:gestion_i, gestion_privilegios:gestion_p, descuento_permitido:descuento_permitido, ver_totales: ver_t},function(err){
			if (!err){
				res.sendStatus(201);
			}else{
				res.sendStatus(404);
			}
		});
	});

module.exports = router;
