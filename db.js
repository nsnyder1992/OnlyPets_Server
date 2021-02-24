const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

//create Sequelize instance and connect to only-pets db table
const sequelize = new Sequelize("only-pets", "postgres", "password", {
  host: "localhost",
  dialect: "postgres",
});

//authenticate() sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the database", err);
  });

//init db as an empty object to store all db related models/objects/functions
const db = {};

//main instances
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//models
db.user = sequelize.import("./models/user");
db.pet = sequelize.import("./models/pet");
db.post = sequelize.import("./models/post");

//through tables for associations later
db.likes = sequelize.define("likes", {
  //Users like posts
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
  //users follow pets
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
//For a better understanding of relationships go to:
//https://database.guide/the-3-types-of-relationships-in-database-design/
const createAssoc = async () => {
  //user owns pets
  await db.user.hasMany(db.pet);
  await db.pet.belongsTo(db.user);

  //pet -> posts
  await db.pet.hasMany(db.post);
  await db.post.belongsTo(db.pet);

  //users likes posts
  await db.user.belongsToMany(db.post, { through: db.likes });
  await db.post.belongsToMany(db.user, { through: db.likes });

  //users subscribes to pets
  await db.user.belongsToMany(db.pet, { through: db.subscriptions });
  await db.pet.belongsToMany(db.user, { through: db.subscriptions });
};

//add createAssoc function to db object
db.createAssoc = createAssoc;

//sync tables in order to make sure associations do not fail
const syncDB = async () => {
  //tables
  await db.user.sync();
  await db.pet.sync();
  await db.post.sync();
  await db.likes.sync();
  await db.subscriptions.sync();

  //the rest of the table
  await db.sequelize.sync();
};

//add syncDB function to db object
db.sync = syncDB;

module.exports = db;
