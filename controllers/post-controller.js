// router
const router = require("express").Router();

//database
const Post = require("../db").import("../models/post.js");
const Likes = require("../db").import("../models/likes.js");

//validation
// const validateSession = require("../middleware/validate-session");

//cloudinary
const cloudinary = require("cloudinary");
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

////////////////////////////////////////////////
// CLOUDINARY SIGNATURE
////////////////////////////////////////////////
router.get("/cloudinary/:publicId", (req, res) => {
  //constants
  const timestamp = Math.round(new Date().getTime() / 1000);
  const public_id = `id-${timestamp}-${req.params.publicId}`;
  const folder = "onlyPets";

  const params_to_sign = {
    timestamp: timestamp,
    folder: folder,
    public_id: public_id,
  };

  const sig = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);

  res.status(200).json({
    signature: sig,
    timestamp: timestamp,
    folder: folder,
    public_id: public_id,
    key: apiKey,
  });
});

////////////////////////////////////////////////
// CREATE POST
////////////////////////////////////////////////
router.post("/", (req, res) => {
  const postEntry = {
    photoUrl: req.body.photoUrl,
    description: req.body.description,
    likes: req.body.likes || 0,
    petId: req.body.petId,
  };

  Post.create(postEntry)
    .then((post) => res.status(200).json(post))
    .catch((err) => res.status(500).json({ error: err }));
});

////////////////////////////////////////////////
// GET POSTS
////////////////////////////////////////////////
router.get("/:page/:limit", async (req, res) => {
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;
  const query = {
    limit: limit,
    offset: offset,
    order: [["createdAt", "DESC"]],
  };

  const count = await Post.count();

  Post.findAll(query)
    .then((posts) => {
      const restRes = { posts: posts, total: count };
      res.status(200).json(restRes);
    })
    .then((err) => res.status(500).json(err));
});

////////////////////////////////////////////////
// GET POSTS BY PET
////////////////////////////////////////////////
router.get("/byPet/:petID", (req, res) => {
  Post.findAll({ where: { petId: req.params.petID } })
    .then((posts) => res.status(200).json(posts))
    .catch((err) => res.status(500).json({ err }));
});

////////////////////////////////////////////////
// GET POST
////////////////////////////////////////////////
router.get("/:postID", (req, res) => {
  Post.findOne({ where: { id: req.params.postID } })
    .then((post) => res.status(200).json(post))
    .catch((err) => res.status(500).json({ err }));
});

////////////////////////////////////////////////
// UPDATE POST
////////////////////////////////////////////////
router.put("/:postID", (req, res) => {
  console.log(req.params.postID);
  const postEntry = {
    photoUrl: req.body.photoUrl,
    description: req.body.description,
    petId: req.body.petId,
  };

  const query = { where: { id: req.params.postID } };

  Post.update(postEntry, query).then((post) => res.status(200).json(post));
  // .catch((err) => res.status(500).json({ error: err }));
});

///////////////////////////////////////////////////////////////
//DELETE POST
///////////////////////////////////////////////////////////////
router.delete("/:postID", (req, res) => {
  const query = { where: { id: req.params.postID } };

  Post.destroy(query)
    .then(() => res.status(200).json({ message: "Post Removed" }))
    .catch((err) => res.status(500).json({ error: err }));
});

module.exports = router;
