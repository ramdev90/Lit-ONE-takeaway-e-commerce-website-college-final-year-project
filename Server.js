const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const dotenv = require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const Mongo = require("connect-mongo")(session);
const port = process.env.PORT || 3000;
const indexRoutes = require("./Routes/index");
const sellerRoutes = require("./Routes/Seller");
const customerRoutes = require("./Routes/Customer");
const deliveryRoutes = require("./Routes/DeliveryBoy");
const mongoose = require("mongoose");
const expressHbs = require("express-handlebars");
const {
  allowInsecurePrototypeAccess
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const path = require("path");

mongoose.connect(
  "mongodb://127.0.0.1:27017/takeaway",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  err => {
    if (err) {
      console.log(err);
    }
  }
);

require("./Config/Passport");
app.engine(
  ".hbs",
  expressHbs({
    defaultLayout: "layout",
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars)
  })
);
app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "Session",
    resave: true,
    saveUninitialized: true,
    store: new Mongo({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 100 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use(flash());

app.use("/", indexRoutes);
app.use("/", sellerRoutes);
app.use("/", customerRoutes);
app.use("/", deliveryRoutes);

app.listen(port);
