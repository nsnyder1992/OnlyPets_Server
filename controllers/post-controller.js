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
  //required constants by cloudinary api
  const timestamp = Math.round(new Date().getTime() / 1000);
  const public_id = `id-${timestamp}-${req.params.publicId}`;
  const folder = "onlyPets";

  const params_to_sign = {
    timestamp: timestamp,
    folder: folder,
    public_id: public_id,
  };

  //get signature to return to client
  const sig = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);

  //return all parameters
  res.status(200).json({
    signature: sig,
    timestamp: timestamp,
    folder: folder,
    public_id: public_id,
    key: apiKey,
  });
});

////////////////////////////////////////////////
// CLOUDINARY DELETE SIGNATURE (NOT WORKING)
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
// GET POSTS (PAGINATED)
////////////////////////////////////////////////
router.get("/:page/:limit", async (req, res) => {
  //setup pagination constants
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  //get posts from pagination and createdAt Descending order
  //most recent posts will be sent first
  const query = {
    limit: limit,
    offset: offset,
    order: [["createdAt", "DESC"]],
  };

  //get total number of posts
  const count = await Post.count();

  //get posts and return them with count
  Post.findAll(query)
    .then((posts) => {
      const restRes = { posts: posts, total: count };
      res.status(200).json(restRes);
    })
    .then((err) => res.status(500).json(err))
    .catch((err) => console.log(err));
});

////////////////////////////////////////////////
// GET ALL LIKED BY PET TYPE (PAGINATED)
////////////////////////////////////////////////
router.get("/liked/:type/:page/:limit", async (req, res) => {
  //setup pagination parameters and pet type
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;
  const type = req.params.type;

  try {
    //find liked query without pagination and pet type
    //these will be added later
    const query = {
      order: [["createdAt", "DESC"]],
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
    };

    //set pet type to req type if not set to all
    if (type !== "all") query.include[1].where = { type: req.params.type };

    //get count of all posts with query without pagination
    const count = await Post.count(query);

    //set query pagination params and get posts
    query.limit = limit;
    query.offset = offset;
    const posts = await Post.findAll(query);

    res.status(200).json({ posts, count });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// GET ALL SUBSCRIBED BY PET TYPE (PAGINATED)
////////////////////////////////////////////////
router.get("/subscribed/:type/:page/:limit", async (req, res) => {
  //setup pagination parameters and pet type
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;
  const type = req.params.type;

  try {
    //get user subscribed pets
    const resSub = await Subscriptions.findAll({
      attributes: ["petId"],
      where: { userId: req.user.id },
    });
    const subscribedJson = await JSON.stringify(resSub);
    const subscribed = await JSON.parse(subscribedJson);
    let subPetIds = [];

    for (pet of subscribed) subPetIds.push(pet.petId);

    //query without pagination and pet type
    //these will be added later
    const query = {
      order: [["createdAt", "DESC"]],
      where: { petId: subPetIds },
      include: {
        model: Pet,
        include: {
          model: User,
          attributes: ["id", "username"],
        },
      },
    };

    //set pet type to req type if not set to all
    if (type !== "all") query.include.where = { type: req.params.type };

    //get count without pagination parameters
    const count = await Post.count(query);

    //add paginated query params to query
    query.limit = limit;
    query.offset = offset;

    //paginate posts based on subscribed pets
    const posts = await Post.findAll(query);

    res.status(200).json({ posts, count });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

////////////////////////////////////////////////
// GET POSTS BY PET TYPE (PAGINATED)
////////////////////////////////////////////////
router.get("/byPetType/:type/:page/:limit", async (req, res) => {
  //setup pagination parameters
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  //get Pets and the owners information
  const query = {
    order: [["createdAt", "DESC"]],
    include: {
      model: Pet,
      include: {
        model: User,
        attributes: ["id", "username"],
      },
    },
  };

  //if not requested type not "all" add type to query
  if (req.params.type !== "all")
    query.include.where = { type: req.params.type };

  //get current count without pagination parameters
  const count = await Post.count(query);

  //add pagination parameters
  query.limit = limit;
  query.offset = offset;

  //get pets and return them with count
  try {
    const posts = await Post.findAll(query);
    const restRes = { posts: posts, total: count };
    res.status(200).json(restRes);
  } catch (err) {
    console.log(err);
  }
});

////////////////////////////////////////////////
// GET POSTS BY PET (PAGINATED)
////////////////////////////////////////////////
router.get("/byPet/:petID/:page/:limit", async (req, res) => {
  //setup pagination constants
  const limit = req.params.limit;
  const offset = (req.params.page - 1) * limit;

  const query = {
    where: { petId: req.params.petID },
    limit: limit,
    offset: offset,
    order: [["createdAt", "DESC"]],
  };

  //get all pet posts
  const count = await Post.count({ where: { petId: req.params.petID } });

  //get posts by pet and return them with total count
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
// GET POST BY ID
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
  //find Post and include Pet to get owner id
  const post = await Post.findOne({
    where: { id: req.params.postID },
    include: Pet,
  });
  const owner = post.pet.userId;

  //if not the owner of the pet return not Authorized
  if (req.user.id != owner)
    return res.status(401).json({ msg: "You are not the owner of the post" });

  const postEntry = {
    photoUrl: req.body.photoUrl,
    description: req.body.description,
    petId: req.body.petId,
  };

  const query = { where: { id: req.params.postID } };

  //update Post
  Post.update(postEntry, query)
    .then((post) => res.status(200).json(post))
    .catch((err) => res.status(500).json({ error: err }));
});

///////////////////////////////////////////////////////////////
//DELETE POST
///////////////////////////////////////////////////////////////
router.delete("/:postID", async (req, res) => {
  //find Post and include Pet to get owner id
  const post = await Post.findOne({
    where: { id: req.params.postID },
    include: Pet,
  });
  const owner = post.pet.userId;

  //if not the owner of the pet return not Authorized
  if (req.user.id != owner)
    return res.status(401).json({ msg: "You are not the owner of the post" });

  const query = { where: { id: req.params.postID } };

  Post.destroy(query)
    .then(() => res.status(200).json({ message: "Post Removed" }))
    .catch((err) => res.status(500).json({ error: err }));
});

module.exports = router;
