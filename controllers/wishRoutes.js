var express = require("express");
var db = require("../models");
var _ = require('underscore');
var middleware = require('../middleware.js')(db);

var router = express.Router();

/**
 * This route is for the landing page
 */
router.get("/", middleware.landingAuthentication, function(req, res) {
  res.render("landing");
});

/**
 * This route is for the wishes page. It will only be available when the
 * user is logged in
 */
router.get('/wishes', middleware.requireAuthentication, function(req, res) {
  var where = {
    id: req.user.get('id')
  };

  db.user.findOne({
    where: where
  }).then(function(userData) {
    if (!userData.funeral_type) {
      res.render('wishes');
    } else {
      if (!userData.funeral_subtype) {
        res.render('second');
      }
    }
  }, function(e) {
    req.flash('error', 'Oops, something went wrong while pulling your data. Please try again later.');
    res.redirect('/');
  });
});

/**
 * This route is for the first selection page
 */
router.get('/wishes/first', middleware.requireAuthentication, function(req, res) {
  // var funeral_type = req.query.funeral_type;
  if (!req.query.hasOwnProperty('funeral_type')) {
    res.redirect('/wishes');
  }


});

module.exports = router;