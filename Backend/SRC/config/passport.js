const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const Usuario = require('../app/models/usuario');

  passport.serializeUser(function (usuario, done) {
    done(null, usuario.id);
  });

  passport.deserializeUser(function (id, done) {
    Usuario.findById(id, function (err, usuario) {
      done(err, usuario);
    });
  });

  // Signup
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'rut',
    passwordField: 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function (req, rut, password, done) {
    Usuario.findOne({'rut': req.body.rut}, function (err, usuario) {
      if (err) {
        return done(err);
      }
      if (usuario) {
        return done(null, false, req.flash('signupMessage', 'the rut is already taken'));
      } else {
        var newUsuario = new Usuario();
        newUsuario.rut = rut;
        newUsuario.nombre = req.body.nombre;
        newUsuario.telefono = req.body.telefono;
        newUsuario.rol = req.body.rol;
        newUsuario.sucursal = req.body.sucursal;
        newUsuario.password = newUsuario.generateHash(password);
        newUsuario.gestion_empleado = req.body.gestion_empleado;
        newUsuario.gestion_inventario = req.body.gestion_inventario;
        newUsuario.gestion_privilegios = req.body.gestion_privilegios;
        newUsuario.descuento_permitido = req.body.descuento_permitido;
        newUsuario.ver_totales = req.body.ver_totales;
        newUsuario.save(function (err) {
          if (err) { throw err; }
          return done(null, newUsuario);
        });
      }
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'rut',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, rut, password, done) {
    Usuario.findOne({'rut': rut}, function (err, usuario) {
      if (err) { return done(err); }
      if (!usuario) {
        return done(null, false, req.flash('loginMessage', 'No User found'))
      }
      if (!usuario.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Wrong. password'));
      }
      return done(null, usuario);
    });
  }));

module.exports = passport;
