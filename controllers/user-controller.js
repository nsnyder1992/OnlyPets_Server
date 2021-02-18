const router = require("express").Router();

//database
const User = require("../db").import("../models/user.js");

//Authentication
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

////////////////////////////////////////////////
// USER SIGNUP
////////////////////////////////////////////////
router.post("/create", (req, res) => {
  User.create({
    username: req.body.username,
    passwordhash: bcrypt.hashSync(req.body.password, 13),
  })
    .then((user) => {
      let token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: 60 * 60 * 24,
        }
      );

      res.status(200).json({
        user: user,
        message: "User successfully created",
        sessionToken: token,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

////////////////////////////////////////////////
// USER LOGIN
////////////////////////////////////////////////
router.post("/login", (req, res) => {
  const query = { where: { username: req.body.username } };
  User.findOne(query).then((user) => {
    if (!user) return res.status(500).json({ error: "User Not Found" });
    bcrypt.compare(req.body.password, user.passwordhash, (err, matches) => {
      if (!matches) return res.status(502).json({ error: "Login Failed" });

      let token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 60 * 60 * 24,
        }
      );

      res.status(200).json({
        user: user,
        message: `${user.username} logged in!`,
        sessionToken: token,
      });
    });
  });
});

module.exports = router;
