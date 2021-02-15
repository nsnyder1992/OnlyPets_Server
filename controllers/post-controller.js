// router
const router = require("express").Router();

//file upload
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//database
const Post = require("../db").import("../models/post.js");

//validation
// const validateSession = require("../middleware/validate-session");

////////////////////////////////////////////////
// TEST POST
////////////////////////////////////////////////
router.get("/test", (req, res) => {
  console.log("test");
  res.json({ test: true });
});

////////////////////////////////////////////////
// CREATE POST
////////////////////////////////////////////////
router.post("/", upload.single("postImage"), (req, res) => {
  const postEntry = {
    photo: req.file.buffer,
    photoType: req.file.mimetype,
    description: req.body.description,
    likes: 0,
    petId: 0,
  };

  console.log(postEntry);
  Post.create(postEntry)
    .then((post) => res.status(200).json(post))
    .catch((err) => res.status(500).json({ error: err }));
});

////////////////////////////////////////////////
// GET POSTS
////////////////////////////////////////////////
router.get("/", (req, res) => {
  Post.findAll()
    .then((posts) => {
      posts.map((post) => {
        post.photo = post.photo.toString("base64");
      });
      res.status(200).json(posts);
    })
    .catch((err) => res.status(500).json({ err }));
});

////////////////////////////////////////////////
// GET POSTS BY PET
////////////////////////////////////////////////
router.get("/byPet/:petID", (req, res) => {
  Post.findAll({ where: { petId: req.params.petID } })
    .then((posts) => {
      posts.map((post) => {
        post.photo = post.photo.toString("base64");
      });
      res.status(200).json(posts);
    })
    .catch((err) => res.status(500).json({ err }));
});

////////////////////////////////////////////////
// GET POST
////////////////////////////////////////////////
router.get("/:postID", (req, res) => {
  Post.findOne({ where: { id: req.params.postID } })
    .then((post) => {
      post.photo = post.photo.toString("base64");
      res.status(200).json(post);
    })
    .catch((err) => res.status(500).json({ err }));
});

////////////////////////////////////////////////
// UPDATE POST
////////////////////////////////////////////////
router.put("/:postID", upload.single("postImage"), (req, res) => {
  const postEntry = {
    photo: req.file.buffer,
    photoType: req.file.mimetype,
    description: req.body.description,
    likes: 0,
    petId: 0,
  };

  const query = { where: { id: req.params.postID } };

  Post.update(postEntry, query)
    .then((post) => res.status(200).json(post))
    .catch((err) => res.status(500).json({ error: err }));
});

////////////////////////////////////////////////
// LIKE POST
////////////////////////////////////////////////
router.put("/like/:postID", upload.single("postImage"), (req, res) => {
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
router.put("/unlike/:postID", upload.single("postImage"), (req, res) => {
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
