// npm libraries
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

// imported files
var authRoutes = require("./controllers/authRoutes.js");
var wishRoutes = require("./controllers/wishRoutes.js");
var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;
var sessionSecret = process.env.SESSION_SECRET || 'Backup session secret';

app.use(cookieParser());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));
// specify static content location
app.use(express.static(process.cwd() + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
// method override to make requests other than GET and POST
app.use(methodOverride("_method"));

app.use(flash());

// setting up ejs engine
app.set("view engine", "ejs");

app.use(function(req, res, next) {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.currentUser = req.user;
  next();
});

app.use("/", authRoutes);
app.use("/", wishRoutes);

db.sequelize.sync().then(function() {
  app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
  });
});