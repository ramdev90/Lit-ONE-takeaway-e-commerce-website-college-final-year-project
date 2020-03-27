const router = require("express").Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const passport = require("passport");

router.get("/Seller", notSeller, (req, res, next) => {
	const messages = req.flash("error");
	res.render("seller/register", {
		title: "Create new account | Seller",
		messages: messages,
		hasErrors: messages.length > 0
	});
});

router.get("/add-product", isSeller, async (req, res, next) => {
	const user = req.user;
	res.render("seller/add-new-product", {
		title: "add new product | Seller",
		user
	});
});

router.post("/postProduct", isSeller, async (req, res, next) => {
	const title = req.body.title;
	if (title == "") {
		req.flash("success", "Title is required");
	}
	const newProduct = new Product({
		productName: req.body.title,
		productImage: req.body.image,
		productDescription: req.body.desc,
		productPrice: req.body.price,
		productQty: req.body.qty,
		sellerId: req.user.id
	});
	newProduct
		.save()
		.then((data) => {
			res.redirect("/view-product-details");
		})
		.catch((err) => {
			res.json(err);
		});
});

router.post(
	"/seller",
	passport.authenticate("seller", {
		successRedirect: "/deatils",
		failureRedirect: "/seller",
		failureFlash: true
	})
);

router.get("/view-product-details", isSeller, async (req, res, next) => {
	const user = req.user;
	const myProducts = await Product.find({ sellerId: req.user.id }).sort({
		_id: -1
	});
	res.render("seller/product-details", {
		title: "Your Product Details | Seller",
		user,
		myProducts,
		length: myProducts.length
	});
});

router.post("/delete-product/:id", async (req, res, next) => {
	await Product.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
		if (err) {
			return req.flash("success", err);
		} else {
			req.flash("success", "Product Deleted");
			res.redirect("/view-product-details");
		}
	});
});

router.get("/update-product/:id", isSeller, async (req, res, next) => {
	const user = req.user;
	const product = await Product.findOne({ _id: req.params.id });
	// console.log(product);
	res.render("seller/product-update", {
		title: "Update a Product | Seller",
		product,
		user
	});
});

router.post("/updateProduct/:id", async (req, res, next) => {
	Product.findByIdAndUpdate(
		{ _id: req.params.id },
		{
			$set: {
				productName: req.body.title,
				productImage: req.body.image,
				productDescription: req.body.desc,
				productPrice: req.body.price,
				productQty: req.body.qty
			}
		},
		(err, data) => {
			if (err) {
				res.render(err);
			} else {
				console.log(data);
			}
		}
	);
	res.redirect("/view-product-details");
});

router.get("/seller-profile", isSeller, async (req, res, next) => {
	const user = req.user;
	res.render("seller/profile", { title: user.email + " Profile", user });
});

router.get("/order-received", async (req, res, next) => {
	const user = req.user;
	const myOrder = await Order.find({ sellerId: user.id, isAccepted: false })
		.sort({ _id: -1 })
		.populate("cart");
	res.render("seller/Order-received.hbs", {
		title: "Your Shop received this order",
		user,
		myOrder,
		length: myOrder.length
	});
});

router.post("/accept-order/:id", async (req, res, next) => {
	const user = req.user;
	const order = await Order.find({ sellerId: user.id });
	if (order) {
		const id = await Order.findOneAndUpdate(
			{ _id: req.params.id },
			{
				$set: {
					isAccepted: true
				}
			}
		);
		res.redirect("/order-received");
	}
});

router.get("/accepted-orders", isSeller, async (req, res, next) => {
	const user = req.user;
	const viewOrder = await Order.find({
		sellerId: user.id,
		isAccepted: true
	}).populate("cart");
	console.log(viewOrder);
	res.render("seller/accepted-order", {
		title: "Your accepted orders",
		orders: viewOrder,
		length: viewOrder.length,
		user
	});
});

router.get("/details", isSeller, (req, res, next) => {
	const user = req.user;
	res.render("seller/add-details", {
		title: "Fill your first time details",
		user
	});
});

module.exports = router;

function isSeller(req, res, next) {
	if (req.isAuthenticated() && req.user.isSeller == true) {
		return next();
	} else {
		res.redirect("/login");
	}
}

function notSeller(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	if (req.user.isSeller == false) {
		return res.redirect("/");
	}
	res.redirect("/");
}
