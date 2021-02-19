module.exports = (sequelize, DataTypes) => {
  const Subscriptions = sequelize.define("subscriptions", {
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
