const router = require("express").Router();
const passport = require("passport");
const Order = require("../Models/Order");

router.get("/Delivery-register", (req, res, next) => {
  res.render("delivery/register", {
    title: "Create new account | Delivery Boy"
  });
});

router.get("/order-confirmed", async (req, res, next) => {
  const user = req.user;
  const viewOrders = await Order.find({ isAccepted: true }).populate("cart");
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

router.post("/");

module.exports = router;
