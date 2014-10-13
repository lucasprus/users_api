/*
 * User Routes
 */
var User = require('../data/models/user');
var loadUser = require('./middleware/load_user');
var async = require('async');
var maxUsersPerPage = 5;

function sleep(milliseconds) {
  var start = new Date()
    .valueOf();
  while ((new Date()
    .valueOf() - start) < milliseconds) {}
}

module.exports = function (app) {
  app.get('/api/users', function (req, res, next) {
    var page = (req.query.page && parseInt(req.query.page, 10)) || 1;
    async.parallel([

        function (next) {
          User.count(next);
        },
        function (next) {
          User.find({})
            .sort('username')
            .skip((page - 1) * maxUsersPerPage)
            .limit(maxUsersPerPage)
            .exec(next);
        }
      ],
      // final callback

      function (err, results) {
        if (err) {
          return next(err);
        }
        var count = results[0],
          users = results[1];
        res.json({
          users: users,
          count: count,
          maxUsersPerPage: maxUsersPerPage
        });
      });
  });
  app.get('/api/users/:name', loadUser, function (req, res) {
    // console.log( req.user.hasOwnProperty('email'));
    return res.json(req.user);
  });
  app.post('/api/users', function (req, res) {
    req.body.username = req.body.clientUsername; // client username to username
    User.create(req.body, function (err, newUser) {
      if (err) {
        if (err.code === 11000 || err.code === 11001) {
          return res.json({
            error: 'Username already exists'
          }, 409);
        }
        if (err.name === 'ValidationError') {
          return res.json({
            error: Object.keys(err.errors).map(function (errField) {
              return err.errors[errField].message;
            }).join(' \n')
          }, 406);
        }
        return res.json({
          error: err
        }, 500);
      }
      return res.json(newUser);
    });
  });
  app.put('/api/users/:name', loadUser, function (req, res) {
    req.user.set('name', req.body.name);
    req.user.set('email', req.body.email);
    req.user.set('password', req.body.password);
    req.user.set('birthday', req.body.birthday);
    req.user.set('gender', req.body.gender);
    req.user.set('bio', req.body.bio);
    req.user.save(function (err, updatedUser) {
      if (err) {
        if (err.code === 11000 || err.code === 11001) {
          return res.json({
            error: 'Username already exists'
          }, 409);
        }
        if (err.name === 'ValidationError') {
          return res.json({
            error: Object.keys(err.errors).map(function (errField) {
              return err.errors[errField].message;
            }).join('. ')
          }, 406);
        }
        return res.json({
          error: err
        }, 500);
      }
      return res.json(updatedUser);
    });
  });
  app.del('/api/users/:name', loadUser, function (req, res) {
    req.user.remove(function (err) {
      if (err) {
        res.json({
          error: err
        }, 500);
      } else {
        res.json();
      }
    });
  });


  // Endpoints for stats

  app.get('/api/users/stats/age-groups', function (req, res) {
    res.json([{
      "key": "< 20",
      "value": 90
    }, {
      "key": "[20, 30)",
      "value": 66
    }, {
      "key": "[30, 40)",
      "value": 45
    }, {
      "key": "[40, 50)",
      "value": 120
    }, {
      "key": "[50, 60)",
      "value": 220
    }, {
      "key": "[60, 70)",
      "value": 320
    }, {
      "key": "[70, 80)",
      "value": 78
    }, {
      "key": ">= 80",
      "value": 95
    }]);
  });

  app.get('/api/users/stats/activity', function (req, res) {
    function randomValue() {
      return Math.random() * 1000 + 500;
    }

    function randomSample(n) {
      var i, arr = [];
      for (i = 0; i < n; i = i + 1) {
        arr.push(randomValue());
      }
      return arr;
    }

    res.json({
      "meta": {
        "startDate": 1394409600000
      },
      "data": {
        "< 20": randomSample(20),
        "[20, 30)": randomSample(20),
        "[30, 40)": randomSample(20)
      }
    });
  });

  app.get('/api/users/stats/gender-by-age-groups', function (req, res) {
    res.json([{
      "key": "< 20",
      "value": [{
        "key": "Males",
        "value": 158
      }, {
        "key": "Females",
        "value": 154
      }]
    }, {
      "key": "[20, 30)",
      "value": [{
        "key": "Males",
        "value": 78
      }, {
        "key": "Females",
        "value": 73
      }]
    }, {
      "key": "[30, 40)",
      "value": [{
        "key": "Males",
        "value": 78
      }, {
        "key": "Females",
        "value": 73
      }]
    }, {
      "key": "[40, 50)",
      "value": [{
        "key": "Males",
        "value": 78
      }, {
        "key": "Females",
        "value": 73
      }]
    }, {
      "key": "[50, 60)",
      "value": [{
        "key": "Males",
        "value": 78
      }, {
        "key": "Females",
        "value": 73
      }]
    }, {
      "key": "[60, 70)",
      "value": [{
        "key": "Males",
        "value": 78
      }, {
        "key": "Females",
        "value": 73
      }]
    }, {
      "key": "[70, 80)",
      "value": [{
        "key": "Males",
        "value": 78
      }, {
        "key": "Females",
        "value": 73
      }]
    }, {
      "key": ">= 80",
      "value": [{
        "key": "Males",
        "value": 22
      }, {
        "key": "Females",
        "value": 20
      }]
    }]);
  });


  app.get('/api/count', function (req, res, next) {
    var page = (req.query.page && parseInt(req.query.page, 10)) || 1;

    /*    var d = new Date(),
    currentYear = d.getFullYear();*/

    /*    var _80yearsAgo = d.setFullYear(currentYear - 80),
    _70yearsAgo = d.setFullYear(currentYear - 70),
    _60yearsAgo = d.setFullYear(currentYear - 60),
    _50yearsAgo = d.setFullYear(currentYear - 50),
    _40yearsAgo = d.setFullYear(currentYear - 40),
    _30yearsAgo = d.setFullYear(currentYear - 30),
    _20yearsAgo = d.setFullYear(currentYear - 20);*/



    /*    User.group(   {
     key: {gender: 1},
     cond: { birthday: { $gt: new Date( '1970-10-10' ) } },
     reduce: function ( curr, result ) { },
     initial: { }
   }, function (err, count) {

      if (err) {
        return res.json({
          error: err
        }, 500);
      }

      res.json({
        count: count
      });

    });*/





    /*User.aggregate({
        $group: {
          _id: '$gender',
          maxBirthday: {
            $max: '$birthday'
          },
          minBirthday: {
            $min: '$birthday'
          },
          count: {
            $sum: 1
          }
        }
      },
      function (err, result) {

        if (err) {
          return res.json({
            error: err
          }, 500);
        }

        res.json({
          result: result
        });

      });*/




    /*    User.count({
      gender: /f/i,
      birthday: {$gte: new Date('1970-10-10')}
    }, function (err, count) {

      if (err) {
        return res.json({
          error: err
        }, 500);
      }

      res.json({
        count: count
      });

    });*/


  });


};
