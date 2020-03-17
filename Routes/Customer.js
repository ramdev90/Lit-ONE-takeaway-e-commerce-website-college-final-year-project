const router = require("express").Router();
const passport = require("passport");
const Cart = require("../Models/Cart");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const nodemailer = require("nodemailer");

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
    const newOrder = new Order({
      amountPaid: cart.totalPrice,
      cart: cart.id,
      accountId: req.user.id,
      sellerId: cart.sellerId,
      customerName: req.body.c_name,
      customerAddress: req.body.c_address,
      cardHolderName: req.body.cardHolderName,
      cardNumber: req.body.cardNumber,
      expMonth: req.body.expMonth,
      expYear: req.body.expYear,
      cardCVV: req.body.cardCVV
    });
    newOrder
      .save()
      .then(data => {
        const mailOptions = {
          from: "teamviewer993@gmail.com",
          to: req.user.email,
          subject: "Your order has been confirmed...",
          text:
            "Hello " +
            newOrder.customerName +
            ", Your order has been placed by takeaway online shopping market at dated " +
            newOrder.createdAt +
            " ,The order details is " +
            cart.title +
            "Your order id is " +
            newOrder.id +
            " give this id to a delivery boy for the confirmation. " +
            "Thank you..."
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Email sent " + info.response);
          }
        });
        // console.log(data);
        res.redirect("/order-summery");
      })
      .catch(err => {
        console.log(err);
      });
  }
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
