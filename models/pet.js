module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define("pet", {
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    moneyToSubscribe: {
      type: DataTypes.DECIMAL(10, 2),
    },
    ownerId: {
      type: DataTypes.INTEGER,
    },
  });
  return Pet;
};


