// const Pet = require("../db").import("./pet.js");

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("post", {
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  });
  return Post;
};
