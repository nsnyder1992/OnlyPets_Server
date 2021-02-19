module.exports = (sequelize, DataTypes) => {
  const Subscriptions = sequelize.define("likes", {
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return Subscriptions;
};
