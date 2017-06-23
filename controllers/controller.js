var express = require("express");
var db = require("../models");
var _ = require('underscore');

var router = express.Router();

router.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user) {
    res.json(user.toPublicJSON())
  }, function(e) {
    res.status(400).json(e);
  });
});

router.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function(user) {
    var token = user.generateToken('authentication');

    if (token){
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }
  }, function() {
    res.status(401).send();
  });
});

module.exports = router;