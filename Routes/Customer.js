const router = require("express").Router();
const passport = require("passport");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const { APIKEY } = require("../Config/stripe");
const Stripe = require("stripe")(APIKEY);

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "akshmistry001998",
		pass: "8669026894"
	}
});

router.get("/customer", notCustomer, (req, res, next) => {
	const messages = req.flash("error");
	res.render("customer/register", {
		title: "Create new account | Customer",
		messages: messages,
		hasErrors: messages.length > 0
	});
});

router.get("/add-to-cart/:id", async (req, res, next) => {
	const productID = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	const user = req.user;
	await Product.findById(productID, (err, product) => {
		if (err) {
			res.redirect("/");
		}
		cart.add(product, product._id, product.productName);
		req.session.cart = cart;
		// console.log(cart);
		res.redirect("/shopping-cart");
	});
});

router.get("/reduce/:id", (req, res, next) => {
	const productID = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productID);
	req.session.cart = cart;
	res.redirect("/shopping-cart");
});

router.get("/addByOne/:id", (req, res, next) => {
	const productID = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.addByOne(productID);
	req.session.cart = cart;
	res.redirect("/shopping-cart");
});

router.get("/shopping-cart", isCustomer, (req, res, next) => {
	if (!req.session.cart) {
		return res.render("customer/shopping-cart", { products: null });
	}
	const user = req.user;
	var cart = new Cart(req.session.cart);
	res.render("customer/shopping-cart", {
		products: cart.generateArray(),
		totalPrice: cart.totalPrice,
		user
	});
});

router.post(
	"/customer-register",
	passport.authenticate("customer", {
		successRedirect: "/",
		failureRedirect: "/customer",
		failureFlash: true
	})
);

router.post(
	"/login",
	passport.authenticate("login", {
		successRedirect: "/",
		failureRedirect: "/failed",
		failureFlash: true
	})
);

router.get("/profile", isCustomer, (req, res, next) => {
	res.json("You Are a Customer");
});

router.get("/checkout", isCustomer, async (req, res, next) => {
	if (!req.session.cart) {
		return res.redirect("shopping-cart", { products: null });
	}
	var cart = new Cart(req.session.cart);
	const user = req.user;
	// console.log(cart.totalPrice);
	res.render("shop/checkout", {
		title: "Takeaway | Buying Products",
		user,
		totalPrice: cart.totalPrice
	});
});

router.post("/checkout", isCustomer, async (req, res, next) => {
	if (!req.session.cart) {
		return res.redirect("shopping-cart", { products: null });
	} else {
		var cart = new Cart(req.session.cart);
		Stripe.charges.create(
			{
				amount: cart.totalPrice * 100,
				currency: "usd",
				source: req.body.stripeToken, // Obtained from Stripe.js
				description: "Takeaway Testing Payments"
			},
			(err, charge) => {
				if (err) {
					console.log(err);
					req.flash("err", err.message);
					return res.redirect("/checkout");
				}
				const response = new Order({
					cart: cart.id,
					accountId: req.user.id,
					sellerId: cart.sellerId,
					amountPaid: cart.totalPrice,
					customerName: req.body.c_name,
					customerAddress: req.body.c_address,
					paymentId: charge.id
				}).save((err, result) => {
					if (err) {
						console.log("Database Saving Error : " + err);
						res.redirect("/checkout");
					}
					req.flash("success", "order successfull");
					console.log("Stripe success");
					req.session.cart = null;
					res.redirect("/order-summery");
				});
				console.log(response);
			}
		);
	}
});

router.get("/order-summery", isCustomer, async (req, res, next) => {
	var successMsg = req.flash("success")[0];
	const user = req.user;
	const orderDetails = await Order.find({ accountId: req.user.id }).populate(
		"cart"
	);
	// console.log(orderDetails);
	res.render("customer/order-Summery", {
		title: "Your order summery",
		successMsg,
		noMessage: !successMsg,
		order: orderDetails,
		length: orderDetails.length,
		user
	});
});

router.get("/all-details-of-order/:id", async (req, res, next) => {
	const user = req.user;
	const id = await await Order.findById({ _id: req.params.id })
		.populate("cart")
		.populate("sellerId");
	res.render("customer/receipt", {
		title: "your order receipt",
		data: id,
		user
	});
});

module.exports = router;

function isCustomer(req, res, next) {
	if (req.isAuthenticated() && req.user.isCustomer == true) {
		return next();
	} else {
		res.redirect("/login");
	}
}

function notCustomer(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	if (req.user.isCustomer == false) {
		return res.redirect("/");
	}
	res.redirect("/");
}
