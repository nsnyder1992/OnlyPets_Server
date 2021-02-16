// router
const router = require("express").Router();

//database
const Post = require("../db").import("../models/post.js");

//validation
// const validateSession = require("../middleware/validate-session");

//cloudinary
const cloudinary = require("cloudinary");
const cloudinaryUrl = `http://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload?api_key=${process.env.CLOUDINARY_API_KEY}`;

////////////////////////////////////////////////
// CLOUDINARY SIGNATURE
////////////////////////////////////////////////
router.get("/cloudinary/:publicId", (req, res) => {
  let timestamp = Math.round(new Date().getTime() / 1000);

  let params_to_sign = {
    timestamp: timestamp,
    folder: "onlyPets",
    public_id: `id-${timestamp}-${req.params.publicId}`,
  };

  let sig = cloudinary.utils.api_sign_request(
    params_to_sign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    signature: sig,
    timestamp: timestamp,
    folder: "onlyPets",
    public_id: `id-${timestamp}-${req.params.publicId}`,
    key: process.env.CLOUDINARY_API_KEY,
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
router.get("/", (req, res) => {
  Post.findAll()
    .then((posts) => res.status(200).json(posts))
    .catch((err) => res.status(500).json({ err }));
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
  console.log(req.body);
  const postEntry = {
    photoUrl: req.body.photoUrl,
    description: req.body.description,
    petId: req.body.petId,
  };

  const query = { where: { id: req.params.postID } };

  Post.update(postEntry, query)
    .then((post) => res.status(200).json(post))
    .catch((err) => res.status(500).json({ error: err }));
});

////////////////////////////////////////////////
// LIKE POST
////////////////////////////////////////////////
router.put("/like/:postID", (req, res) => {
  const query = { where: { id: req.params.postID } };
  let likes;

  Post.findOne(query)
    .then((post) => {
      likes = post.likes + 1;
      const postEntry = {
        likes: likes,
      };

      Post.update(postEntry, query)
        .then((post) => res.status(200).json(post))
        .catch((err) => res.status(500).json({ error: err }));
    })
    .catch((err) => res.status(500).json({ err }));
});

////////////////////////////////////////////////
// UNLIKE POST
////////////////////////////////////////////////
router.put("/unlike/:postID", (req, res) => {
  const query = { where: { id: req.params.postID } };
  let likes;

  Post.findOne(query)
    .then((post) => {
      likes = post.likes > 0 ? post.likes - 1 : 0;
      const postEntry = {
        likes: likes,
      };

      Post.update(postEntry, query)
        .then((post) => res.status(200).json(post))
        .catch((err) => res.status(500).json({ error: err }));
    })
    .catch((err) => res.status(500).json({ err }));
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
