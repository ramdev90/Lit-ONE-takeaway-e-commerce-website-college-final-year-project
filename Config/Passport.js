const Passport = require("passport");
const localPassport = require("passport-local").Strategy;
const User = require("../models/User");

Passport.serializeUser((user, done) => {
	done(null, user.id);
});

Passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

// Seller Register
// ****************************************************** //
Passport.use(
	"seller",
	new localPassport(
		{
			usernameField: "email",
			passwordField: "password",
			passReqToCallback: true
		},
		(req, email, password, done) => {
			User.findOne({ email: email }, (err, user) => {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(null, false, {
						message: "Email is already in used"
					});
				}
				const newUser = new User({
					email: email,
					password: password,
					isSeller: true
				});
				newUser.save((err, result) => {
					if (err) {
						return done(err);
					} else {
						return done(null, newUser);
					}
				});
			});
		}
	)
);

// Customer Register
// ****************************************************** //
Passport.use(
	"customer",
	new localPassport(
		{
			usernameField: "email",
			passwordField: "password",
			passReqToCallback: true
		},
		(req, email, password, done) => {
			User.findOne({ email: email }, (err, user) => {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(null, false, {
						message: "Email is already in use"
					});
				}
			});
			const newCustomer = new User({
				email: email,
				password: password,
				isCustomer: true
			});
			newCustomer.save((err) => {
				if (err) {
					return done(err);
				}
				return done(null, newCustomer);
			});
		}
	)
);

// Delivery boy register
// ****************************************************** //
Passport.use(
	"deliveryboy",
	new localPassport(
		{
			usernameField: "email",
			passwordField: "password",
			passReqToCallback: true
		},
		(req, email, password, done) => {
			User.findOne({ email: email }, (err, user) => {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(null, false, {
						message: "Email is Already in used"
					});
				}
			});
			const newDeliveryBoy = new User({
				email: email,
				password: password,
				isDelivery: true
			});
			newDeliveryBoy.save((err) => {
				if (err) {
					return done(err);
				}
				return done(null, newDeliveryBoy);
			});
		}
	)
);

// All User Login
// ****************************************************** //
Passport.use(
	"login",
	new localPassport(
		{
			usernameField: "email",
			passwordField: "password",
			passReqToCallback: true
		},
		(req, email, password, done) => {
			User.findOne({ email: email }, (err, user) => {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: "No user found with this email"
					});
				}
				if (user.password != password) {
					return done(null, false, {
						message: "Invalid Password"
					});
				}
				return done(null, user);
			});
		}
	)
);
