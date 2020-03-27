const router = require("express").Router();
const passport = require("passport");
const Order = require("../models/Order");

router.get("/Delivery", notDelivery, (req, res, next) => {
	res.render("delivery/register", {
		title: "Create new account | Delivery Boy"
	});
});

router.get("/order-confirmed", async (req, res, next) => {
	const user = req.user;
	const viewOrders = await Order.find({
		isAccepted: true,
		outForDelivery: false
	}).populate("cart");
	// console.log(viewOrders);
	res.render("delivery/acceptedorder", {
		title: "Accpted Orders",
		user,
		order: viewOrders,
		length: viewOrders.length
	});
});

router.post(
	"/delivery",
	passport.authenticate("deliveryboy", {
		successRedirect: "/",
		failureRedirect: "/delivery-register",
		failureFlash: true
	})
);

router.post("/outfordelivery/:id", async (req, res, next) => {
	try {
		const updateOrder = await Order.updateOne(
			{ _id: req.params.id },
			{ $set: { outForDelivery: true } }
		);
		console.log(updateOrder);
		res.redirect("/order-confirmed");
	} catch (err) {
		console.log(err);
	}
});

router.get("/outfordelivery", async (req, res, next) => {
	const user = req.user;
	const delivery = await Order.find({
		isAccepted: false,
		outForDelivery: true
	});
	console.log(delivery);
	res.render("delivery/outfordelivery", { title: "Ongoing Delivery", user });
});

module.exports = router;

function isDelivery(req, res, next) {
	if (req.isAuthenticated() && req.user.isDelivery == true) {
		return next();
	} else {
		res.redirect("/login");
	}
}

function notDelivery(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	if (req.user.isDelivery == false) {
		return res.redirect("/");
	}
	res.redirect("/");
}
