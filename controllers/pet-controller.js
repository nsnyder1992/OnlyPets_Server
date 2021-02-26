const express = require("express");
const router = express.Router();
const Pet = require("../db").pet;
const User = require("../db").user;
const Subscriptions = require("../db").subscriptions;

////////////////////////////////////////////////
// GET ALL PETS
////////////////////////////////////////////////
router.get("/", async (req, res) => {
  //get total number of pets
  const count = await Pet.count();

  //get pets and returns them with owner information and count
  //this is based off of the pagination constants
  Pet.findAll({
    include: {
      model: User,
      attributes: ["id", "username"],
    },
  })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets, count });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET ALL PETS (PAGINATED)
////////////////////////////////////////////////
router.get("/:page/:limit", async (req, res) => {
  //set up pagination constants
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  //get total number of pets
  const count = await Pet.count();

  //get pets and returns them with owner information and count
  //this is based off of the pagination constants
  Pet.findAll({
    limit: limit,
    offset: offset,
    include: {
      model: User,
      attributes: ["id", "username"],
    },
  })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets, count });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET ALL PETS BY OWNER (NOT PAGINATED)
////////////////////////////////////////////////
router.get("/owned", async (req, res) => {
  //get total number of owned pets by the user
  const count = await Pet.count({
    where: { userId: req.user.id },
  });

  //get pets and return them with owner information and count
  Pet.findAll({
    include: {
      model: User,
      attributes: ["id", "username"],
    },
    where: { userId: req.user.id },
  })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets, count });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET ALL PETS BY OWNER (PAGINATED)
////////////////////////////////////////////////
router.get("/owned/:page/:limit", async (req, res) => {
  //set up pagination constants
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  //get total number of owned pets by the user
  const count = await Pet.count({
    where: { userId: req.user.id },
  });

  //get pets and returns them with owner information and count
  //this is based off of the pagination constants
  Pet.findAll({
    limit: limit,
    offset: offset,
    include: {
      model: User,
      attributes: ["id", "username"],
    },
    where: { userId: req.user.id },
  })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets, count });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

////////////////////////////////////////////////
// GET PET BY ID
////////////////////////////////////////////////
router.get("/:id", (req, res) => {
  //get pet by id and return it with Owner information
  Pet.findOne({
    where: { id: req.params.id },
    include: {
      model: User,
      attributes: ["id", "username"],
    },
  })
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
// GET PET BY TYPE  (PAGINATED)
////////////////////////////////////////////////
router.get("/type/:type/:page/:limit", async (req, res) => {
  //setup pagination constants
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  //get current count of Pets of type: requested type
  const count = await Pet.count({ where: { type: req.params.type } });

  //get pets of type: requested type and returns them
  //with owner information and count
  //this is based off of the pagination constants
  Pet.findAll({
    limit: limit,
    offset: offset,
    where: { type: req.params.type },
    include: {
      model: User,
      attributes: ["id", "username"],
    },
  })
    .then((pets) => {
      if (pets.length === 0)
        return res.status(200).json({ message: "No pets found!" });
      res.status(200).json({ pets, count });
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
    userId: req.user.id,
  })
    .then((pet) => {
      //owner subscribes to the pets on Pet creation
      Subscriptions.create({
        petId: pet.id,
        userId: req.user.id,
      }).catch((err) => res.status(500).json(err));
      //return pet
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
  Pet.destroy({ where: { id: req.params.id, userId: req.user.id } })
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
    where: { id: req.params.id, userId: req.user.id },
  })
    .then((response) => {
      res.status(200).json({ message: "Updated Successfully", response });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;
