var User = require('../../data/models/user');

function loadUser(req, res, next) {
  User.findOne({
    username: req.params.name
  }, function (err, user) {
    if (err) {
      return res.json({
        error: err
      }, 500);
    }
    if (!user) {
      return res.json({
        error: 'User not found'
      }, 404);
    }
    req.user = user;
    next();
  });
}
module.exports = loadUser;
