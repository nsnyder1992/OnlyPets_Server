module.exports = (sequelize, DataTypes) => {
  const Likes = sequelize.define("likes", {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return Likes;
};
