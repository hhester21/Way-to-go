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
      res.render('welcome');
    } else {
      if (!userData.funeral_subtype) {
        res.redirect('/funeral-sub-type');
      } else {
        res.redirect('/review');
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
    // remove any existing wishes from the db
    db.wish.destroy({
        where: {
            userId: req.user.get('id')
        }
    }).then(function(rowsDeleted) {
        // Iterate through each wish and insert it into the wishes table
        wishes.forEach(function (wish, index, array) {
            db.wish.create(wish).then(function () {
                // After inserted, increment number of processed items and
                // compare it to total number of items to process.
                itemsProcessed++;
                if (itemsProcessed === array.length) {
                    // render welcome
                    res.redirect('/review');
                }
            }, function (e) {
                // If not successfully inserted, increment number of processed
                // items and compare it to total number of items to process.
                itemsProcessed++;
                if (itemsProcessed === array.length) {
                    // render welcome
                    res.redirect('/welcome');
                }
            });
        });
    });
});

/**
 * Renders funeral type selection page
 */
router.get('/funeral-type', middleware.requireAuthentication, function(req, res) {
    res.render('funeral-type');
});


/**
 * Updates funeral type in database and redirects to appropriate funeral subtype selection page
 */
router.post('/funeral-type', middleware.requireAuthentication, function(req, res) {
    var where = {
        id: req.user.get('id')
    };
    var funeral_type = req.body.type;

    if (funeral_type) {
        db.user.findOne({
            where: where
        }).then(function (user) {
            user.update({ funeral_type: funeral_type }).then(function (user) {
                if (funeral_type === 'Buried') {
                    res.redirect('/buried');
                } else if (funeral_type === 'Burned') {
                    res.redirect('/burned');
                }
            });
        });
    } else {
        res.redirect('/welcome');
    }
});

/**
 * Renders buried options page
 */
router.get('/buried', middleware.requireAuthentication, function(req, res) {
    res.render('buried');
});

/**
 * Saves buried choice to database. Redirects to wishes page
 */
router.post('/buried', middleware.requireAuthentication, function(req, res) {
    var where = {
        id: req.user.get('id')
    };
    var funeral_subtype = req.body.type;

    if (funeral_subtype) {
        db.user.findOne({
            where: where
        }).then(function (user) {
            user.update({ funeral_subtype: funeral_subtype }).then(function (user) {
                res.redirect('/wishes');
            });
        });
    } else {
        res.redirect('/welcome');
    }
});

/**
 * Renders burned options page
 */
router.get('/burned', middleware.requireAuthentication, function(req, res) {
    res.render('burned');
});

/**
 * Saves burned choice to database. Redirects to wishes page
 */
router.post('/burned', middleware.requireAuthentication, function(req, res) {
    var where = {
        id: req.user.get('id')
    };
    var funeral_subtype = req.body.type;

    if (funeral_subtype) {
        db.user.findOne({
            where: where
        }).then(function (user) {
            user.update({ funeral_subtype: funeral_subtype }).then(function (user) {
                res.redirect('/wishes');
            });
        });
    } else {
        res.redirect('/welcome');
    }
});

/**
 * Renders review page
 */
router.get('/review', middleware.requireAuthentication, function(req, res) {
    var where = {
        id: req.user.get('id')
    };

    var reviewData = {};

    db.user.findOne({
        where: where
    }).then(function(userData) {
        reviewData = _.pick(userData, 'first_name', 'last_name', 'funeral_type', 'funeral_subtype');
        where = {
            userId: userData.id
        };
        db.wish.findAll(where).then(function(wishes) {
            reviewData.wishes = wishes;
            res.render('review', { data: reviewData });
        });
    }, function(e) {
        req.flash('error', 'Oops, something went wrong while pulling your data. Please try again later.');
        res.redirect('/');
    });
});

module.exports = router;