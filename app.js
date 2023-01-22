//Path Module
const path = require("path");

//Creating a basic express server
const express = require("express");

//Setup Mongoose Connection for sessions
const mongoose = require("mongoose");

//This will have our configuration and variables
const dotenv = require("dotenv");

//Setup morgan for logging
const morgan = require("morgan");

//Setup Template Engine
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");

//Setup Passport Authentication Strategy
const passport = require("passport");
const session = require("express-session");

//Store sessions to Database using connect-mongo package
const MongoStore = require("connect-mongo");

//Conneting Database function
const connectDB = require("./config/db");

//Load config file
dotenv.config({ path: "./config/config.env" });

//Passport Config
require("./config/passport")(passport);

//Connect to Database
connectDB();

//Initialize App
const app = express();

//Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

//Handlebars
app.engine(".hbs", exphbs.engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");
app.engine(
  ".hbs",
  exphbs.engine({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
);

//Sessions Middleware - always put this above passport middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      mongooseConnection: mongoose.connection,
    }),
  })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

//
const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`)
);

// Dependencies/Packages:
// express: web framework to create routes and stuff
// mongoose: create database, create models
// connect-mongo: store our sessions in our database, so when we reset the server we don't get logged out
// express-session: for sessions and cookies
// express-handlebars: template engine (can also use pug or ejs or react or vue)
// dotenv: for putting environment variables in there
// method-override: allows us to make put and delete requests from template (by default you can only do get and post)
// moment: to formate date
// morgan: logging
// passport: authentication
// Passport-google-oauth20: for Google authentication

// Dev dependencies:
// nodemon
// cross-env
