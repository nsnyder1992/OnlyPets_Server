const express = require("express");
const router = express.Router();
const sequelize = require("../db");
const { route } = require("./user-controller");
const Pet = sequelize.import("../models/pet.js");




router.get("/", (req, res) => {
  Pet.findAll()
    .then((pets) => {
      if (pets.length === 0)
        return res
          .status(200)
          .json({ message: "No pets found!" });
      res.status(200).json({ pets });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

router.post("/create", (req, res) => {
  Pet.create({
    name: req.body.pet.name,
    type: req.body.pet.type,
    description: req.body.pet.description,
    moneyToSuscribe: req.body.pet.moneyToSuscribe,
    ownerId: req.body.pet.ownerId
  })
    .then((pet) => {
      res.status(200).json(pet);
    })
    .catch((error) => {
      res.status(500).json(error);
    });


});
router.delete("/:id", (req, res) => {
  Pet.destroy({ where: { id: req.params.id, } })     //userId: req.user.id 
    .then((response) => {
      res.status(200).json({
        message: "Successfully deleted pet!",
        numOfDeleted: response,
      });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});
router.put("/:id", (req, res) => {
  Pet.update(req.body, {
    where: { id: req.params.id },
  })
    .then((response) => {
      res.status(200).json({ message: "Updated Successfully", response });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});


module.exports = router;







