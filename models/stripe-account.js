module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define("stripe-accounts", {
    stripeAcctId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Account;
};
