const router = require("express").Router();

//database
const Pet = require("../db").import("../models/pet.js");

//validation
// const validateSession = require("../middleware/validate-session");

////////////////////////////////////////////////
// PET TEST
////////////////////////////////////////////////
router.get("/test", (req, res) => {
  console.log("test");
  res.json({ test: true });
});

module.exports = router;
