// npm libraries
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var exphbs = require("express-handlebars");
// imported files
var routes = require("./controllers/controller.js");
var db = require("./models");
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

// specify static content location
app.use(express.static(process.cwd() + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
// method override to make requests other than GET and POST
app.use(methodOverride("_method"));

// setting up handlebars engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use("/", routes);

db.sequelize.sync().then(function() {
  app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
  });
});