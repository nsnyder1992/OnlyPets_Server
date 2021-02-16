module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("post", {
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    likes: {
      type: DataTypes.INTEGER,
    },
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return Post;
};
