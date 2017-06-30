var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var Wish = sequelize.define("wish", {
    wish: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
    {
    classMethods: {
      associate: function(models) {
        Wish.belongsTo(models.user, {
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Wish;
};