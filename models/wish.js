var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var Wish = sequelize.define("wish", {
    wish: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
    {
      indexes: [{
          unique: true,
          fields: ['wish', 'userId']
      }],
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