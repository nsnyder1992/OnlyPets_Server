//environment
require("dotenv").config();

//express
const express = require("express");
const app = express();

//database
const db = require("./db");
db.createAssoc(); //create associations
db.sync(); //sync each table in order

//controllers
const user = require("./controllers/user-controller");
const pet = require("./controllers/pet-controller");
const post = require("./controllers/post-controller");
const like = require("./controllers/like-controller");
const subscription = require("./controllers/subscription-controller");
const stripeCustomer = require("./controllers/stripe-customer-controller");
const stripeAccount = require("./controllers/stripe-Account-controller");

//headers
app.use(require("./middleware/headers"));

//app options
app.options("*", (req, res) => {
  //allows localhost cross-origin on chrome
  res.json({
    status: "OK",
  });
});

//use json (enable to get res.body)
app.use(express.json());

////////////////////////////////////////////////
//Exposed Routes
////////////////////////////////////////////////
app.use("/user", user);

////////////////////////////////////////////////
//Protected Routes
////////////////////////////////////////////////
app.use(require("./middleware/validate-session"));
app.use("/pet", pet);
app.use("/post", post);
app.use("/like", like);
app.use("/subscribe", subscription);
app.use("/stripe/customer", stripeCustomer);
app.use("/stripe/account", stripeAccount);

//app constants
const port = 3001;

app.listen(port, function () {
  console.log(`App is listening on port ${port}`);
});
