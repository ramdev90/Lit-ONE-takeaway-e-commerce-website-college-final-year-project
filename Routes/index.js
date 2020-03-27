const router = require("express").Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const passport = require("passport");

router.get("/", async (req, res, next) => {
	const product = await Product.find().sort({ date: -1 });
	const user = req.user;
	res.render("index", {
		title: "Homepage of Takeaway | Buy or Sell Goods from Here",
		product,
		length: product.length,
		user
	});
});

router.get("/product-details/:id", async (req, res, next) => {
	const detail = await Product.findById({ _id: req.params.id });
	res.render("product/details", { title: "Prodcuts", detail });
});

router.get("/login", (req, res, next) => {
	const messages = req.flash("error");
	res.render("login", {
		title: "Login to your account",
		messages: messages,
		hasErrors: messages.length > 0
	});
});

router.post(
	"/login",
	passport.authenticate("login", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true
	})
);

router.get("/logout", (req, res, next) => {
	req.logout();
	res.redirect("/");
});

module.exports = router;
