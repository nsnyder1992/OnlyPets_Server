// router
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);

const Customer = require("../db").customer;

////////////////////////////////////////////////
// ADD A PAYMENT METHOD (CARD)
////////////////////////////////////////////////
router.post("/addCard", async (req, res) => {
  console.log("charge endpoint:", req.body);
  const { amount, id } = req.body;

  let paymentData = {
    amount: amount,
    currency: "USD",
    payment_method: id,
    // confirmation_method: "manual",
    // confirm: true,
  };

  //check to see if user already has a stripe id if so update customerId
  let customerId;
  const response = await Customer.findOne({ where: { userId: req.user.id } });
  if (response) {
    const customerJson = JSON.stringify(response);
    const customerParse = JSON.parse(customerJson);
    customerId = customerParse.stripeCustId;
    console.log("customer in DB:", customerId);
  }

  //create a new customer in stripe and save id to Stripe model
  if (!customerId) {
    try {
      const customer = await stripe.customers.create();
      await Customer.create({ stripeCustId: customer.id, userId: req.user.id });
      customerId = customer.id;
    } catch (err) {
      console.log("customer creation error", err);
    }
  }

  console.log(
    "charge amount:",
    amount,
    "charge id:",
    id,
    "customer id:",
    customerId
  );

  //create payment intent and send it back
  try {
    paymentData.customer = customerId;
    paymentData.setup_future_usage = "off_session";

    const paymentIntent = await stripe.paymentIntents.create(paymentData);

    console.log("payment intent:", paymentIntent);

    res.status(200).json(paymentIntent);
  } catch (error) {
    console.log("stripe error:", error);
    res.status(500).json({
      message: "Payment Failed",
      success: false,
    });
  }
});

////////////////////////////////////////////////
// GET ALL PAYMENT METHODS
////////////////////////////////////////////////
router.get("/payment/methods", async (req, res) => {
  console.log("starting payment methods request");
  try {
    //check to see if user already has a stripe id if so update customerId
    let customerId;
    const response = await Customer.findOne({ where: { userId: req.user.id } });
    if (!response)
      return res.json({
        message: "No Stripe User id available. Add a Card!",
        hasCard: false,
      });

    const customerJson = JSON.stringify(response);
    const customerParse = JSON.parse(customerJson);
    customerId = customerParse.stripeCustId;
    console.log("customer in DB:", customerId);

    const stripeParams = {
      customer: customerId,
      type: "card",
    };
    const paymentMethods = await stripe.paymentMethods.list(stripeParams);
    console.log(paymentMethods);

    res.status(200).json({ paymentMethods, hasCard: true });
  } catch (error) {
    console.log(error);
  }
});

////////////////////////////////////////////////
// TIP PET BY ID
////////////////////////////////////////////////
/*https://betterprogramming.pub/stripe-api-tutorial-with-react-and-node-js-1c8f2020a825 */
router.post("/tip/:petId", async (req, res) => {
  const { amount, payment_method, off_session } = req.body;

  try {
    //Make sure user has a stripe id if so update customerId
    let customerId;
    const response = await Customer.findOne({ where: { userId: req.user.id } });
    if (!response)
      return res.json({
        message: "No Stripe User id available. Add a Card!",
        hasCard: false,
      });

    const customerJson = JSON.stringify(response);
    const customerParse = JSON.parse(customerJson);
    customerId = customerParse.stripeCustId;
    console.log("customer in DB:", customerId);

    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: "USD",
      description: "JustPets",
      customer: customerId,
      payment_method: payment_method,
      off_session: true,
      confirm: true,
    });

    res.status(200).json(payment);
  } catch (err) {
    console.log(err);
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(
      err?.raw?.payment_intent?.id
    );
    console.log("PI retrieved: ", paymentIntentRetrieved.id);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
