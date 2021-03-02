module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define("stripe-customers", {
    stripeCustId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Customer;
};
