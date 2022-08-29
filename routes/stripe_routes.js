const express = require("express");
const router = express.Router();
const stripe = require("../services/stripe");


router.post("/pay", async function (req, res, next) {
  try {
    console.log(req.body);
    res.json(await stripe.payStripe(req.body));
  } catch (err) {
    console.error(`Error in stripe`, err.message);
    next(err);
  }
});

router.post("/sub", async function (req, res, next) {
  try {
    console.log(req.body);
    res.json(await stripe.subStripe(req.body));
  } catch (err) {
    console.error(`Error in stripe`, err.message);
    next(err);
  }
});

router.post("/transfer", async function (req, res, next) {
  try {
    res.json(await stripe.transferOwnership(req.body));
  } catch (err) {
    console.error(`Error in stripe`, err.message);
    next(err);
  }
});


module.exports = router;
