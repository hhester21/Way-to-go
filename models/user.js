var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("user", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function(value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    funeral_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    funeral_subtype: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    hooks: {
      beforeValidate: function(user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function(resolve, reject) {
          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject();
          }

          User.findOne({
            where: {
              email: body.email
            }
          }).then(function(user) {
            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
              return reject();
            }

            resolve(user);
          }, function(e) {
            reject();
          });
        });
      },
      findByToken: function(token) {
        return new Promise(function(resolve, reject) {
          try {
            var decodedJWT = jwt.verify(token, process.env.TOKEN_SECRET || 'qwerty098');
            var bytes = cryptojs.AES.decrypt(decodedJWT.token, process.env.ENCRYPTION_KEY || 'abc123!@#$');
            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

            User.findById(tokenData.id).then(function(user) {
              if (user) {
                resolve(user);
              } else {
                // id provided doesn't exist in DB
                reject();
              }
            }, function(e) {
              // findById fails
              reject();
            });
          } catch(e) {
            // token isn't a valid format
            reject();
          }
        });
      },
      associate: function(models) {
        User.hasMany(models.wish, {
          onDelete: "cascade"
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function() {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      },
      generateToken: function(type) {
        if (!_.isString(type)) {
          return undefined;
        }

        try {
          var stringData = JSON.stringify({ id: this.get('id'), type: type });
          var encryptedData = cryptojs.AES.encrypt(stringData, process.env.ENCRYPTION_KEY || 'abc123!@#$').toString();
          var token = jwt.sign({
            token: encryptedData
          }, process.env.TOKEN_SECRET || 'qwerty098');

          return token;
        } catch(e) {
          // no valid token created
          return undefined;
        }
      }
    }
  });
  return User;
};