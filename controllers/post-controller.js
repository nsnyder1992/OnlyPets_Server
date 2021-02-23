// router
const router = require("express").Router();

//database
const Post = require("../db").post;
const Pet = require("../db").pet;
const User = require("../db").user;
const Likes = require("../db").likes;
const Subscriptions = require("../db").subscriptions;

//cloudinary
const cloudinary = require("cloudinary");
const cloudName = process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

////////////////////////////////////////////////
// CLOUDINARY POST SIGNATURE
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
// CLOUDINARY DELETE SIGNATURE
////////////////////////////////////////////////
router.get("/cloudinary/delete/:folder/:publicId", (req, res) => {
  //constants
  const timestamp = Math.round(new Date().getTime() / 1000);
  const publicId = `${req.params.publicId}`; //${req.params.folder}/

  const params_to_sign = {
    timestamp: timestamp,
    // folder: req.params.folder,
    public_id: publicId,
    invalidate: true,
  };

  const sig = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);

  res.status(200).json({
    signature: sig,
    timestamp: timestamp,
    // folder: req.params.folder,
    public_id: publicId,
    invalidate: true,
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
    petId: req.body.petId,
    petType: req.body.petType,
    ownerId: req.user.id,
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
    .then((err) => res.status(500).json(err))
    .catch((err) => console.log(err));
});

////////////////////////////////////////////////
// GET ALL LIKED
////////////////////////////////////////////////
router.get("/liked", async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          where: { id: req.user.id },
        },
        {
          model: Pet,
        },
      ],
    });

    res.status(200).json({ posts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// GET ALL SUBSCRIBED
////////////////////////////////////////////////
router.get("/subscribed", async (req, res) => {
  try {
    const resSub = await Subscriptions.findAll({
      attributes: ["petId"],
      where: { userId: req.user.id },
    });
    const subscribedJson = await JSON.stringify(resSub);
    const subscribed = await JSON.parse(subscribedJson);
    let subPetIds = [];

    for (pet of subscribed) subPetIds.push(pet.petId);

    console.log(subPetIds);
    const posts = await Post.findAll({
      include: {
        model: Pet,
        include: {
          model: User,
          attributes: ["id", "username"],
        },
      },
      where: { petId: subPetIds },
    });

    res.status(200).json({ posts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// GET POSTS BY PET TYPE
////////////////////////////////////////////////
router.get("/byPetType/:type/:page/:limit", async (req, res) => {
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  const query = {
    limit: limit,
    offset: offset,
    order: [["createdAt", "DESC"]],
    include: {
      model: Pet,
      include: {
        model: User,
        attributes: ["id", "username"],
      },
    },
  };

  if (req.params.type !== "all")
    query.include.where = { type: req.params.type };

  const count = await Post.count(query);

  try {
    const posts = await Post.findAll(query);
    // const postPets = await Post.getPet();
    const restRes = { posts: posts, total: count };
    res.status(200).json(restRes);
  } catch (err) {
    console.log(err);
  }
});

////////////////////////////////////////////////
// GET POSTS BY PET
////////////////////////////////////////////////
router.get("/byPet/:petID/:page/:limit", async (req, res) => {
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;
  const query = {
    where: { petId: req.params.petID },
    limit: limit,
    offset: offset,
    order: [["createdAt", "DESC"]],
  };

  const count = await Post.count({ where: { petId: req.params.petID } });

  Post.findAll(query)
    .then((posts) => {
      const restRes = { posts: posts, total: count };
      res.status(200).json(restRes);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
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
router.put("/:postID", async (req, res) => {
  console.log(req.params.postID);
  const post = await Post.findOne({
    where: { id: req.params.postID },
    include: Pet,
  });
  const owner = post.pet.userId;

  if (req.user.id != owner)
    return res.status(401).json({ msg: "You are not the owner of the post" });

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

///////////////////////////////////////////////////////////////
//DELETE POST
///////////////////////////////////////////////////////////////
router.delete("/:postID", async (req, res) => {
  const query = { where: { id: req.params.postID } };

  Post.destroy(query)
    .then(() => res.status(200).json({ message: "Post Removed" }))
    .catch((err) => res.status(500).json({ error: err }));
});

module.exports = router;
