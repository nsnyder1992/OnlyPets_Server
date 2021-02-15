//environment
require("dotenv").config();

//express
const express = require("express");
const app = express();

//database
const sequelize = require("./db");
sequelize.sync();

//controllers
const user = require("./controllers/user-controller");
const pet = require("./controllers/pet-controller");
const post = require("./controllers/post-controller");

//headers
app.use(require("./middleware/headers"));

//app options
app.options("*", (req, res) => {
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
app.use("/pet", pet);
app.use("/post", post);

//app constants
const port = 3001;

app.listen(port, function () {
  console.log(`App is listening on port ${port}`);
});
