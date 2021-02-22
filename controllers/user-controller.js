require("dotenv");
let express = require("express");
const router = require("express").Router();
const User = require("../db").sequelize.import("../models/user.js");
const jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");

const validateSession = require("../middleware/validate-session");

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

//////////////////////////////////////////////////////////////////////
// GET USER BY ID
//////////////////////////////////////////////////////////////////////
router.get("/byId/:id", validateSession, (req, res) => {
  User.findOne({ where: { id: req.params.id } })
    .then((user) => {
      res.status(200).json({ username: user.username });
    })
    .catch((err) => res.status(500).json({ err: err }));
});

//////////////////////////////////////////////////////////////////////
// GET LOGGED IN USER BY TOKEN
//////////////////////////////////////////////////////////////////////
router.get("/self", validateSession, (req, res) => {
  User.findOne({ where: { id: req.user.id } })
    .then((user) => {
      res.status(200).json({ username: user.username });
    })
    .catch((err) => res.status(500).json({ err: err }));
});

module.exports = router;
