const Sequelize = require("sequelize");

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
db.pet = sequelize.import("./models/pet");
db.post = sequelize.import("./models/post");

//associations
db.pet.hasMany(db.post, { as: "posts" });
db.post.belongsTo(db.post, {
  foreignKey: "petId",
  as: "pets",
});

module.exports = db;
