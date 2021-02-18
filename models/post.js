module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("post", {
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return Post;
};
