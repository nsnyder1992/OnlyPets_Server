// router
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);

const fetch = require("node-fetch");

const Account = require("../db").account;

////////////////////////////////////////////////
// ONBOARD USER AND CREATE AN ACCOUNT
////////////////////////////////////////////////
//https://stripe.com/docs/connect/enable-payment-acceptance-guide
router.post("/onboard", async (req, res) => {
  try {
    const account = await stripe.accounts.create({ type: "standard" });

    console.log("stripe account:", account);
    await Account.create({ stripeAcctId: account.id, userId: req.user.id });
    req.session.accountID = account.id;

    console.log("Account created");

    const origin = `${req.headers.origin}`;
    const accountLinkURL = await generateAccountLink(account.id, origin);
    res.status(200).json({ url: accountLinkURL });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

////////////////////////////////////////////////
// GET REFRESH LINK
////////////////////////////////////////////////
router.get("/onboard/refresh", async (req, res) => {
  if (!req.session.accountID) {
    res.redirect("/");
    return;
  }
  try {
    const { accountID } = req.session;
    const origin = `${req.secure ? "https://" : "https://"}${req.headers.host}`;

    const accountLinkURL = await generateAccountLink(accountID, origin);
    res.redirect(accountLinkURL);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

////////////////////////////////////////////////
// GET ACCOUNT DETAILS
////////////////////////////////////////////////
router.get("/details", async (req, res) => {
  const acctRes = await Account.findOne({ where: { userId: req.user.id } });
  const acctJson = await JSON.stringify(acctRes);
  const acctParse = await JSON.parse(acctJson);
  const acctId = acctParse.stripeAcctId;

  fetch(`https://api.stripe.com/v1/accounts/${acctId}`, {
    method: "GET",
    headers: {
      authorization: process.env.STRIPE_SECRET_TEST,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log("stripe account:", json);
      res.status(200).json(json);
    })
    .catch((err) => console.log(err));
});

function generateAccountLink(accountID, origin) {
  return stripe.accountLinks
    .create({
      type: "account_onboarding",
      account: accountID,
      refresh_url: `${origin}/onboard-user/refresh`,
      return_url: `${origin}/`,
    })
    .then((link) => link.url);
}

module.exports = router;
