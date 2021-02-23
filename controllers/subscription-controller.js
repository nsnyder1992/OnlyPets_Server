// router
const router = require("express").Router();

//database
const Subscriptions = require("../db").subscriptions;

////////////////////////////////////////////////
// GET SUBSCRIBERS
////////////////////////////////////////////////
router.get("/:petID", (req, res) => {
  Subscriptions.findAll({
    where: { petId: req.params.petID },
  })
    .then((subscribers) => res.status(200).json({ subscribers: subscribers }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

////////////////////////////////////////////////
// GET NUMBER OF SUBSCRIBERS
////////////////////////////////////////////////
router.get("/num/:petID", async (req, res) => {
  console.log("num");
  try {
    const numSub = await Subscriptions.count({
      where: { petId: req.params.petID },
    });
    const isSubed = await Subscriptions.findOne({
      where: { petId: req.params.petID, userId: req.user.id },
    });

    res.status(200).json({ numSub: numSub, userSub: isSubed ? true : false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// SUBSCRIBE PET
////////////////////////////////////////////////
router.post("/:petID", async (req, res) => {
  try {
    const createQuery = {
      petId: req.params.petID,
      userId: req.user.id,
    };

    const isSubed = await Subscriptions.findOne({ where: createQuery });

    let numSub = await Subscriptions.count({
      where: { petId: req.params.petID },
    });

    if (isSubed)
      return res
        .status(200)
        .json({ numSub: numSub, userSub: true, msg: "Already Subscribed" }); // already liked exit function

    await Subscriptions.create(createQuery);

    numSub = await Subscriptions.count({
      where: { petId: req.params.petID },
    });

    res.status(200).json({ numSub: numSub, userSub: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// UNLIKE POST
////////////////////////////////////////////////
router.delete("/:petID", async (req, res) => {
  try {
    const deleteQuery = {
      petId: req.params.petID,
      userId: req.user.id,
    };
    const isSubed = await Subscriptions.findOne({ where: deleteQuery });

    let numSub = await Subscriptions.count({
      where: { petId: req.params.petID },
    });
    if (!isSubed)
      return res.status(200).json({
        numSub: numSub,
        userSub: false,
        msg: "Already NOT Subscribed",
      }); // already NOT liked exit function

    await Subscriptions.destroy({ where: deleteQuery });

    numSub = await Subscriptions.count({ where: { petId: req.params.petID } });

    res.status(200).json({ numSub: numSub, userSub: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
