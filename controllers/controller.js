var express = require("express");
var db = require("../models");
var _ = require('underscore');
var middleware = require('../middleware.js')(db);

var router = express.Router();

router.get("/", function(req, res) {
  res.render("landing");
});

// REGISTER
router.post('/users', function(req, res) {
  // post request comes back with email and password
  // _.pick gets the email and password elements from the req.body object passed in
  // we do this in case the request has other "malicious" elements we don't care about
  var body = _.pick(req.body, 'email', 'password');

  // inserts into users table with email and password strings.
  // password isn't really inserted; it's hashed value is
  db.user.create(body).then(function(user) {
    // user was successfully inserted into the DB
    // res.json(user.toPublicJSON())
    res.redirect("/");
  }, function(e) {
    res.status(400).json(e);
  });
});

// LOGIN
router.post('/users/login', function(req, res) {
  // post request comes back with email and password
  // _.pick gets the email and password elements from the req.body object passed in
  // we do this in case the request has other "malicious" elements we don't care about
  var body = _.pick(req.body, 'email', 'password');
  var userInstance;

  // Call User's authenticate Class Method. This basically looks for the email in the DB,
  // checks is correct using a bcrypt method, and returns if password for email is correct
  db.user.authenticate(body).then(function(user) {
    // email found in DB and password was correct
    // Now create token to know from now on this user is doing stuff around the site
    var token = user.generateToken('authentication');
    userInstance = user;

    // insert token into DB and from now on allow user to do stuff only if matching token
    // is in DB
    return db.token.create({
      token: token
    });
  }).then(function (tokenInstance) {
    // if token inserted correctly, add token to the header of the request as 'Auth'
    // for future requests
    res.header('Auth', tokenInstance.get('token')).render('wishes');
  }).catch(function() {
    res.status(401).send();
  });
});

// LOGOUT by deleting token from DB
router.delete('/users/login', middleware.requireAuthentication, function(req, res) {
  // Remove token (found in request) from the DB
  // now user won't be able to see stuff on the website
  req.token.destroy().then(function() {
    res.status(204).send();
  }).catch(function() {
    res.status(500).send();
  });
});

module.exports = router;