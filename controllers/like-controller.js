// router
const router = require("express").Router();

//database
const Likes = require("../db").likes;
const Post = require("../db").post;

////////////////////////////////////////////////
// GET NUMBER OF LIKES BY ID
////////////////////////////////////////////////
router.get("/:postID", async (req, res) => {
  //get post number of likes for given id and
  //whether or not user liked the post
  try {
    //get number of likes
    const likes = await Likes.count({ where: { postId: req.params.postID } });

    //find out if user has liked the post or not
    const liked = await Likes.findOne({
      where: { postId: req.params.postID, userId: req.user.id },
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

    //find out if the user has already liked the post
    const isLiked = await Likes.findOne({ where: createQuery });

    //get current count
    let likes = await Likes.count({ where: { postId: req.params.postID } });

    // already liked exit function
    if (isLiked)
      return res
        .status(200)
        .json({ numLikes: likes, userLiked: true, msg: "Already Liked" });

    //if not already liked, add user like
    await Likes.create(createQuery);

    //get updated like count
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

    //find out if the user has already liked the post
    const isLiked = await Likes.findOne({ where: deleteQuery });

    //get current count
    let likes = await Likes.count({ where: { postId: req.params.postID } });

    // if already NOT liked exit function
    if (!isLiked)
      return res
        .status(200)
        .json({ numLikes: likes, userLiked: false, msg: "Already NOT Liked" });

    //if liked, delete user like from post
    await Likes.destroy({ where: deleteQuery });

    //update count
    likes = await Likes.count({ where: { postId: req.params.postID } });

    res.status(200).json({ numLikes: likes, userLiked: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
