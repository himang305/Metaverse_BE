const express = require("express");
const router = express.Router();
const nft_details = require("../services/nft_details");

/* GET NFT. */
router.get("/", async function (req, res, next) {
  try {
    res.json(await nft_details.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting nfts `, err.message);
    next(err);
  }
});

/* POST NFT */
router.post("/", async function (req, res, next) {
  try {
    console.log(req.body);
    res.json(await nft_details.create(req.body));
  } catch (err) {
    console.error(`Error while creating nfts`, err.message);
    next(err);
  }
});

/* PUT NFT */
router.put("/:id", async function (req, res, next) {
  try {
    console.log(req.params.id);
    console.log(req.body);
    res.json(await nft_details.update(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating nfts`, err.message);
    next(err);
  }
});

/* DELETE NFT */
router.delete("/:id", async function (req, res, next) {
  try {
    res.json(await nft_details.remove(req.params.id));
  } catch (err) {
    console.error(`Error while deleting nfts`, err.message);
    next(err);
  }
});

module.exports = router;
