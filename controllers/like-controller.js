// router
const router = require("express").Router();

//database
const Likes = require("../db").likes;
const Post = require("../db").post;

////////////////////////////////////////////////
// GET LIKES
////////////////////////////////////////////////
router.get("/", async (req, res) => {
  try {
    const posts = await Likes.findAll({
      where: { postId: req.params.postID, userId: req.user.id },
      include: Post,
    });

    res.status(200).json({ posts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// GET LIKES
////////////////////////////////////////////////
router.get("/:postID", async (req, res) => {
  try {
    const likes = await Likes.count({ where: { postId: req.params.postID } });
    const liked = await Likes.findOne({
      where: { postId: req.params.postID, userId: req.user.id },
      include: Post,
    });

    res.status(200).json({ numLikes: likes, userLiked: liked ? true : false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// LIKE POST
////////////////////////////////////////////////
router.post("/:postID", async (req, res) => {
  try {
    const createQuery = {
      postId: req.params.postID,
      userId: req.user.id,
    };
    const isLiked = await Likes.findOne({ where: createQuery });

    let likes = await Likes.count({ where: { postId: req.params.postID } });
    if (isLiked)
      return res
        .status(200)
        .json({ numLikes: likes, userLiked: true, msg: "Already Liked" }); // already liked exit function

    await Likes.create(createQuery);

    likes = await Likes.count({ where: { postId: req.params.postID } });

    res.status(200).json({ numLikes: likes, userLiked: true });
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
      userId: req.user.id,
    };
    const isLiked = await Likes.findOne({ where: deleteQuery });

    let likes = await Likes.count({ where: { postId: req.params.postID } });
    if (!isLiked)
      return res
        .status(200)
        .json({ numLikes: likes, userLiked: false, msg: "Already NOT Liked" }); // already NOT liked exit function

    await Likes.destroy({ where: deleteQuery });

    likes = await Likes.count({ where: { postId: req.params.postID } });

    res.status(200).json({ numLikes: likes, userLiked: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
