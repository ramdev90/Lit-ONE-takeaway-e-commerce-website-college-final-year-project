const router = require("express").Router();
const passport = require("passport");
const Cart = require("../Models/Cart");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const nodemailer = require("nodemailer");
const { request, response } = require("express");
const { initializePayment, verifyPayment } = require("../Config/paystack")(
	request
);

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
		// console.log(cart.sellerId);
		const form = {
			customerName: req.body.c_name,
			email: req.body.email,
			customerAddress: req.body.c_address,
			amountPaid: cart.totalPrice
		};
		initializePayment(form, (err, body) => {
			if (err) {
				console.log(err);
			}
			response = JSON.parse(body);
			console.log(response);
			res.redirect(response.data.authorization_url);
		});
	}
});

router.get("/paystack/callback", (req, res, next) => {
	const ref = req.query.reference;
	verifyPayment(ref, (err, body) => {
		if (err) {
			console.log(err);
			res.redirect("/error");
		}
		response = JSON.parse(body);
		const data = (_.at(response.data, [
			"reference",
			"amount",
			"email",
			"c_name"
		])[(reference, amount, email, c_name)] = data);
		newOrder = { reference, amount, email, c_name };
		const customer = new Order(newOrder);
		customer
			.save()
			.then((data) => {
				if (data) {
					res.redirect("/receipt/+id");
				}
			})
			.catch((err) => {
				res.redirect("/error");
			});
	});
});

router.get("/order-summery", isCustomer, async (req, res, next) => {
	const user = req.user;
	const orderDetails = await Order.find({ accountId: req.user.id }).populate(
		"cart"
	);
	// console.log(orderDetails);
	res.render("customer/order-Summery", {
		title: "Your order summery",
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
