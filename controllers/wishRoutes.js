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
 * This route is for the welcome page. It will only be available when the
 * user is logged in. If user has selected a funeral type, the funeral type
 * page will be rendered. If it has been selected, but the funeral sub type
 * hasn't, the funeral sub type page will be rendered. If both have been
 * selected, the review page will be rendered instead.
 */
router.get('/welcome', middleware.requireAuthentication, function(req, res) {
  var where = {
    id: req.user.get('id')
  };

  db.user.findOne({
    where: where
  }).then(function(userData) {
    if (!userData.funeral_type) {
      // res.render('funeral-type');
      res.render('welcome');
    } else {
      if (!userData.funeral_subtype) {
        res.render('funeral-sub-type');
      } else {
        res.render('review');
      }
    }
  }, function(e) {
    req.flash('error', 'Oops, something went wrong while pulling your data. Please try again later.');
    res.redirect('/');
  });
});

/**
 * This is the get route for the wishes. The wishes are found and populated on the
 * wishes page.
 */
router.get('/wishes', middleware.requireAuthentication, function(req, res) {
  var where = {
    userId: req.user.get('id')
  }

  // TODO: maybe check if funeral type and funeral sub type have been completed yet?

  db.wish.findAll({ where: where }).then(function(wishes) {
    res.render("wishes", { wishes: wishes });
  }, function(e) {
    res.render("wishes");
  });
});

/**
 * This is the post route for the wishes. The wishes are added to the
 * wishes table and then linked to the logged in user.
 */
router.post('/wishes', middleware.requireAuthentication, function(req, res) {
  // set up wishes for DB insertion. Each will have a wish string
  // and the currently logged in user as its userId
  var wishes = req.body.fields;
  for (var i = 0; i < wishes.length; i++) {
    if (wishes[i] !== '') {
        wishes[i] = {wish: wishes[i], userId: req.user.get('id')};
    }
  }

  var itemsProcessed = 0;
  // Iterate through each wish and insert it into the wishes table
  wishes.forEach(function(wish, index, array) {
    db.wish.create(wish).then(function() {
      // After inserted, increment number of processed items and
      // compare it to total number of items to process.
      itemsProcessed++;
      if (itemsProcessed === array.length) {
        // render welcome
        res.render('welcome');
      }
    }, function(e) {
      // If not successfully inserted, increment number of processed
      // items and compare it to total number of items to process.
      itemsProcessed++;
        if (itemsProcessed === array.length) {
          // render welcome
          res.render('welcome');
        }
    });
  });
});

module.exports = router;