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
    ownerId: {
      type: DataTypes.INTEGER,
    },
  });
};
