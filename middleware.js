var cryptojs = require('crypto-js');

module.exports = function(db) {
  return {
    requireAuthentication: function(req, res, next) {
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
        res.locals.error = req.flash('error');
        res.locals.success = req.flash('success');
        res.locals.currentUser = user;
        next();
      }).catch(function(e) {
        req.flash('error', 'Please Log in First');
        res.redirect('/');
      });
    }
  };
};