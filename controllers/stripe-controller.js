// router
const router = require("express").Router();
const stripe = require("stripe")("sk_test_51IOBbVCpTGapbgrnj3wQ11uTt1Ojpre4KkRefpKTOXt492dx495A9Lt2ipBNUW41pvadAmdgNFTnbQAnhX6SDej3009Mi3GH6v");

router.post('/addCard', (req, res) => {
    const paymentIntent = await stripe.paymentIntent.create({
        amount: 1,
        currency: 'usd'
    });

    res.send({
        clientSecret: paymentIntent.clientSecret
    })
})