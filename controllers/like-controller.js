// router
const router = require("express").Router();

//database
const sequelize = require("../db");
const Likes = require("../db").import("../models/likes.js");

////////////////////////////////////////////////
// LIKE POST
////////////////////////////////////////////////
router.put("/:postID", async (req, res) => {
  try {
    const createQuery = {
      postId: req.params.postID,
      userId: 6, //hardcoded for now. req.user.id later
    };
    const isLiked = await Likes.findOne({ where: createQuery });

    if (isLiked) return res.status(200).json({ msg: "Already Liked!" }); // already liked exit function

    await Likes.create(createQuery);

    const likes = await Likes.count({ where: { postId: req.params.postID } });

    res.status(200).json({ numLikes: likes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// UNLIKE POST
////////////////////////////////////////////////
router.delete("/:postID", async (req, res) => {
  try {
    const deleteQuery = {
      postId: req.params.postID,
      userId: 1, //hardcoded for now. req.user.id later
    };
    const isLiked = await Likes.findOne({ where: deleteQuery });

    if (!isLiked) return res.status(200).json({ msg: 'Already "NOT" Liked!' }); // already liked exit function

    await Likes.destroy({ where: deleteQuery });

    const likes = await Likes.count({ where: { postId: req.params.postID } });

    res.status(200).json({ numLikes: likes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
