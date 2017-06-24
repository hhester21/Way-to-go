var express = require("express");
var db = require("../models");
var _ = require('underscore');
var middleware = require('../middleware.js')(db);

var router = express.Router();

router.get("/", function(req, res) {
  res.render("landing", { currentUser: req.user } );
});

// REGISTER AND LOGIN
router.post('/register', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user) {
    var userInstance;

    db.user.authenticate(body).then(function(user) {
      var token = user.generateToken('authentication');
      userInstance = user;

      return db.token.create({
        token: token
      });
    }).then(function (tokenInstance) {
      res.cookie('auth', tokenInstance.get('token'));
      res.redirect('/wishes');
    }).catch(function() {
      // wrong email or password
      res.redirect('/');
    });
  }, function(e) {
    res.redirect('/')

  });
});

// LOGIN
router.post('/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');
  var userInstance;

  db.user.authenticate(body).then(function(user) {
    var token = user.generateToken('authentication');
    userInstance = user;

    return db.token.create({
      token: token
    });
  }).then(function (tokenInstance) {
    res.cookie('auth', tokenInstance.get('token'));
    res.redirect('/wishes');
  }).catch(function() {
    // wrong email or password
    // req.flash('error', 'The email address or password that you entered is not valid');
    res.redirect('/');
  });
});

// LOGOUT by deleting token from DB
router.get('/logout', middleware.requireAuthentication, function(req, res) {
  req.token.destroy().then(function() {
    res.redirect('/');
  }).catch(function() {
    res.status(500).send();
  });
});

router.get('/wishes', middleware.requireAuthentication, function(req, res) {
  res.render("wishes", { currentUser: req.user} );
});

module.exports = router;