module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define("pet", {
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    moneyToSubscribe: {
      type: DataTypes.DECIMAL(10, 2), // currency to 2 decimal
    },
  });
  return Pet;
};
