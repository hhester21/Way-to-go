var cryptojs = require('crypto-js');

module.exports = function(db) {
  return {
    requireAuthentication: function(req, res, next) {
      // console.log("REQUEST header", req.get('Auth'));
      // var token = req.get('Auth') || '';
      // var token = localStorage.getItem('authToken') || '';
      var token = req.cookies.auth;

      db.token.findOne({
        where: {
          tokenHash: cryptojs.MD5(token).toString()
        }
      }).then(function(tokenInstance) {
        if (!tokenInstance) {
          throw new Error();
        }

        req.token = tokenInstance;
        return db.user.findByToken(token)
      }).then(function(user) {
        req.user = user;
        next();
      }).catch(function() {
        // res.render("notfound");
        res.status(401).send();
      });
    }
  };
};