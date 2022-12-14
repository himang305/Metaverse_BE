const express = require("express");
const router = express.Router();
const nft_details = require("../services/nft_details");

/* GET NFT. */
router.get("/", async function (req, res, next) {
  try {
    if(req.query.address){
      console.log(req.query.address)
      res.json(await nft_details.getMultiplewithaddress(req.query.page, req.query.id, req.query.user, req.query.rentee,req.query.address));
    }else{console.log('no address')
      res.json(await nft_details.getMultiple(req.query.page, req.query.id, req.query.user, req.query.rentee));
    }

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




/* GET USER. */
router.post("/getUser", async function (req, res, next) {
  try {
    res.json(await nft_details.getUsers(req.body));
  } catch (err) {
    console.error(`Error while getting nfts `, err.message);
    next(err);
  }
});

/* Create USER */
router.post("/createUser", async function (req, res, next) {
  try {
    console.log(req.body);
    res.json(await nft_details.createUser(req.body));
  } catch (err) {
    console.error(`Error while creating nfts`, err.message);
    next(err);
  }
});

/* PUT USER */
router.put("/user/:id", async function (req, res, next) {
  try {
    console.log(req.params.id);
    console.log(req.body);
    res.json(await nft_details.updateUser(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating nfts`, err.message);
    next(err);
  }
});



/* GET History. */
router.get("/history", async function (req, res, next) {
  try {
    res.json(await nft_details.getHistory(req.query.nft_id));
  } catch (err) {
    console.error(`Error while getting history `, err.message);
    next(err);
  }
});

/* POST History */
router.post("/history", async function (req, res, next) {
  try {
    console.log(req.body);
    res.json(await nft_details.createHistory(req.body));
  } catch (err) {
    console.error(`Error while creating nfts`, err.message);
    next(err);
  }
});




/* USED for Toekn authorization in header on each API call */
router.get("/private", async function (req, res, next) {
  try {
    res.json(await nft_details.isAuth(req, res, next));
  } catch (err) {
    console.error(`Error while auth `, err.message);
    next(err);
  }
});
/* Updating User Wallet */
router.put("/walletuserupdate/:id/", async function (req, res, next) {
  try {
    console.log(req.params.id);
    console.log(req.body);
    res.json(await nft_details.updateWallet(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating nfts`, err.message);
    next(err);
  }
});

/* Updating Subscription table Wallet */
router.put("/walletsubupdate/:id", async function (req, res, next) {
  try {
    console.log(req.params.id);
    console.log(req.body);
    res.json(await nft_details.walletsubupdate(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating nfts`, err.message);
    next(err);
  }
});

/* GET User Details By Address. */
router.get("/userbyaddress/", async function (req, res, next) {
  try { console.log(req.query.address);
    res.json(await nft_details.getUserDetailsbyaddress(req.query.address));
  } catch (err) {
    console.error(`Error while getting userDetails `, err.message);
    next(err);
  }
});

/*  get nft details by checkbox filter */
/* GET USER. */
router.get("/getnftbycheckbox", async function (req, res, next) {
  try {

    res.json(await nft_details.getnftbycheckbox(req.query.business_type));
  } catch (err) {
    console.error(`Error while getting nfts `, err.message);
    next(err);
  }
});

/*  get nft details by search filter */
/* GET USER. */
router.get("/getnftbysearchbox", async function (req, res, next) {
  try {
    res.json(await nft_details.getnftbysearchbox(req.query.search_value));
  } catch (err) {
    console.error(`Error while getting nfts `, err.message);
    next(err);
  }
});

router.get("/building/:public_url", async function (req, res, next) {
  try {
    console.log(req.params.public_url);
    res.json(await nft_details.getDetails(req.params.public_url));
  } catch (err) {
    console.error(`Error while getting details nfts`, err.message);
    next(err);
  }
});

module.exports = router;
