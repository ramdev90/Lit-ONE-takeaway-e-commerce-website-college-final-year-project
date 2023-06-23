const router = require("express").Router();



router.get("/products", (req, res, next) => {
    console.log("RR")
    res.json({test: "Test"})
})

module.exports = router;