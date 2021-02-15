const router = require("express").Router();

//database
const User = require("../db").import("../models/user.js");

//Authentication
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

////////////////////////////////////////////////
// USER TEST
////////////////////////////////////////////////
router.get("/test", (req, res) => {
  console.log("test");
  res.json({ test: true });
});

module.exports = router;
