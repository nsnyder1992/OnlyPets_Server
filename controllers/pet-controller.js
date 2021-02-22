const express = require("express");
const router = express.Router();
const sequelize = require("../db").sequelize;
const { route } = require("./user-controller");
const Pet = sequelize.import("../models/pet.js");

////////////////////////////////////////////////
// GET ALL PETS
////////////////////////////////////////////////
router.get("/", (req, res) => {
  Pet.findAll()
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET ALL PETS BY OWNER
////////////////////////////////////////////////
router.get("/owned", (req, res) => {
  Pet.findAll({ where: { ownerId: req.user.id } })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET PET BY ID
////////////////////////////////////////////////
router.get("/:id", (req, res) => {
  Pet.findOne({ where: { id: req.params.id } })
    .then((pet) => {
      if (pet.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pet });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET PET BY TYPE
////////////////////////////////////////////////
router.get("/type/:type", (req, res) => {
  Pet.findAll({ where: { type: req.params.type } })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// CREATE PET
////////////////////////////////////////////////
router.post("/create", (req, res) => {
  Pet.create({
    name: req.body.pet.name,
    type: req.body.pet.type,
    description: req.body.pet.description,
    moneyToSubscribe: req.body.pet.moneyToSubscribe,
    ownerId: req.user.id,
  })
    .then((pet) => {
      res.status(200).json(pet);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

////////////////////////////////////////////////
// DELETE PET BY ID
////////////////////////////////////////////////
router.delete("/:id", (req, res) => {
  Pet.destroy({ where: { id: req.params.id } }) //userId: req.user.id
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

////////////////////////////////////////////////
// UPDATE PET BY ID
////////////////////////////////////////////////
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
