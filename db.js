const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

const sequelize = new Sequelize("only-pets", "postgres", "password", {
  host: "localhost",
  dialect: "postgres",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the database", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//tables
db.user = sequelize.import("./models/user");
db.pet = sequelize.import("./models/pet");
db.post = sequelize.import("./models/post");

//through tables
db.likes = sequelize.define("likes", {
  postId: {
    type: DataTypes.INTEGER,
    references: {
      model: db.post,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: db.user,
      key: "id",
    },
  },
});

db.subscriptions = sequelize.define("subscriptions", {
  petId: {
    type: DataTypes.INTEGER,
    references: {
      model: db.pet,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: db.user,
      key: "id",
    },
  },
});

//associations
const createAssoc = async () => {
  //user owns pets
  await db.user.hasMany(db.pet);
  await db.pet.belongsTo(db.user);

  //pet -> posts
  await db.pet.hasMany(db.post);
  await db.post.belongsTo(db.pet);

  //user likes posts
  await db.user.belongsToMany(db.post, { through: db.likes });
  await db.post.belongsToMany(db.user, { through: db.likes });

  //user subscribes to pet
  await db.user.belongsToMany(db.pet, { through: db.subscriptions });
  await db.pet.belongsToMany(db.user, { through: db.subscriptions });
};

db.createAssoc = createAssoc;

//sync
const syncDB = async () => {
  //tables
  await db.user.sync();
  await db.pet.sync();
  await db.post.sync();
  await db.likes.sync();
  await db.subscriptions.sync();

  //the rest
  await db.sequelize.sync();
};

db.sync = syncDB;

module.exports = db;
