require("dotenv");
let express = require("express");
const router = require("express").Router();
const User = require("../db").import("../models/user.js");
const jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");

router.post("/create", function (req, res) {
  User.create({
    username: req.body.user.username,
    passwordHash: bcrypt.hashSync(req.body.user.password, 13),
  })
    .then((user) => {
      let token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: 60 * 60 * 24 }
      );
      console.log(token);
      res.json({
        user: user,
        message: "User successfully created",
        sessionToken: token,
      });
    })

    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/login", function (req, res) {
  User.findOne({
    where: {
      username: req.body.user.username,
    },
  })

    .then((user) => {
      if (user) {
        bcrypt.compare(
          req.body.user.password,
          user.passwordHash,
          function (err, matches) {
            if (matches) {
              let token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: 60 * 60 * 24 }
              );
              console.log(token);
              res.status(200).json({
                user: user,
                message: "User successfully created",
                sessionToken: token,
              });
            } else {
              res.status(502).send({ error: "Login Failed" });
            }
          }
        );
      } else {
        res.status(500).json({ error: "User does not exist." });
      }
    })
    .catch((err) => res.status(500).json({ error: err }));
});

module.exports = router;
