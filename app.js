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
const indexRoutes = require("./routes/index");
const sellerRoutes = require("./routes/seller");
const customerRoutes = require("./routes/customer");
const deliveryRoutes = require("./routes/deliveryBoy");
const mongoose = require("mongoose");
const expressHbs = require("express-handlebars");
const {
	allowInsecurePrototypeAccess
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const path = require("path");

require("./Config/Passport");

mongoose.connect(
	"mongodb://root:abc123@ds211829.mlab.com:11829/takeaway",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	(err) => {
		if (err) {
			console.log(err);
		} else {
			console.log("Connected");
		}
	}
);

// view engine setup
app.set("view engine", "hbs");
app.engine(
	"hbs",
	expressHbs({
		extname: "hbs",
		defaultView: "default",
		layoutsDir: __dirname + "/views/layouts/",
		partialsDir: __dirname + "/views/partials/",
		handlebars: allowInsecurePrototypeAccess(Handlebars)
	})
);

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
