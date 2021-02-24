// router
const router = require("express").Router();

//database
const Subscriptions = require("../db").subscriptions;

////////////////////////////////////////////////
// GET SUBSCRIBERS
////////////////////////////////////////////////
router.get("/:petID", (req, res) => {
  //gets a list of userIds that subscribe to the pet
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
  //get number of subscribers and whether
  //the provided token user is subscribed or not
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
  //subscribe to pet
  try {
    const createQuery = {
      petId: req.params.petID,
      userId: req.user.id,
    };

    //find out if user has already subscribed
    const isSubed = await Subscriptions.findOne({ where: createQuery });

    //get current number of subscribers
    let numSub = await Subscriptions.count({
      where: { petId: req.params.petID },
    });

    // already liked exit function
    if (isSubed)
      return res
        .status(200)
        .json({ numSub: numSub, userSub: true, msg: "Already Subscribed" });

    //add logged in user as a subscriber
    await Subscriptions.create(createQuery);

    //get updated number of subscribers
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
// UNSUBSCRIBE POST
////////////////////////////////////////////////
router.delete("/:petID", async (req, res) => {
  //deletes users subscription and returns
  //number of subscribers
  try {
    const deleteQuery = {
      petId: req.params.petID,
      userId: req.user.id,
    };

    //find out if user has already subscribed
    const isSubed = await Subscriptions.findOne({ where: deleteQuery });

    //current number of subscribers
    let numSub = await Subscriptions.count({
      where: { petId: req.params.petID },
    });

    // already NOT subscribed exit function
    if (!isSubed)
      return res.status(200).json({
        numSub: numSub,
        userSub: false,
        msg: "Already NOT Subscribed",
      });

    //delete user subscription
    await Subscriptions.destroy({ where: deleteQuery });

    //get updated number of subscribers
    numSub = await Subscriptions.count({ where: { petId: req.params.petID } });

    res.status(200).json({ numSub: numSub, userSub: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
