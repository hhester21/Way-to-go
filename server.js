// npm libraries
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');

// imported files
var routes = require("./controllers/controller.js");
var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

app.use(cookieParser());

// specify static content location
app.use(express.static(process.cwd() + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// method override to make requests other than GET and POST
app.use(methodOverride("_method"));

// app.use(flash());

// setting up ejs engine
app.set("view engine", "ejs");

app.use(function(req, res, next) {
  // res.locals.error = req.flash('error');
  // res.locals.success = req.flash('success');
  res.locals.currentUser = req.user;
  next();
});

app.use("/", routes);

db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
  });
});