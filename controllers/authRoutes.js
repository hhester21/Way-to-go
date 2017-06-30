var express = require("express");
var db = require("../models");
var _ = require('underscore');
var middleware = require('../middleware.js')(db);

var router = express.Router();

/***********************************
 *      AUTHENTICATION ROUTES      *
 ***********************************/
/**
 * This route registers the user and then logs them in.
 * It first creates a user in the database with the given
 * email and password, and then authenticates the user.
 * If authentication is successful, a token is generated and
 * set in a cookie.
 */
router.post('/register', function(req, res) {
  var body = _.pick(req.body, 'email', 'password', 'first_name', 'last_name');

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
    if (e.errors && e.errors[0].message === 'email must be unique') {
      req.flash('error', 'The email address you have entered is already registered. Please try again.');
    } else if (e.errors && e.errors[0].message === 'Validation len failed') {
      req.flash('error', 'Your password must be at least 7 characters long. Please try again.');
    }
    res.redirect('/');
  });
});

/**
 * This route log the user in. It first authenticates the user
 * by making sure a user with the given email and password
 * exist in the DB. If they do, a token is generated
 */
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
  }).catch(function(e) {
    // wrong email or password
    req.flash('error', 'The email address or password that you entered is not valid');
    res.redirect('/');
  });
});

/**
 * This route logs the user off. It first removes the token from the
 * DB and redirects the user to the landing page.
 */
router.get('/logout', middleware.requireAuthentication, function(req, res) {
  req.token.destroy().then(function() {
    req.flash('success', 'You have successfully logged out');
    res.redirect('/');
  }).catch(function() {
    res.status(500).send();
  });
});

module.exports = router;