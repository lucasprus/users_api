/*
 * User Routes
 */
var User = require('../data/models/user');
var loadUser = require('./middleware/load_user');
var async = require('async');
var maxUsersPerPage = 5;
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
  app.get('/api/users/stats/age-groups', function (req, res) {
    res.json([{
      "key": "< 20",
      "value": 20
    }, {
      "key": "[20, 30)",
      "value": 20
    }, {
      "key": "[30, 40)",
      "value": 20
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
      "value": 24
    }, {
      "key": ">= 80",
      "value": 20
    }]);
  });
  app.get('/api/users/stats/series-chart-data', function (req, res) {
    res.json({
      "timestamp": 1397121646171,
      "range": {
        "start": 1394409600000,
        "end": 1396998000000,
        "startDate": "2014-03-10T00:00:00.000Z",
        "endDate": "2014-04-09T00:00:00.000+01:00"
      },
      "line": {
        "total": [600.00, 598.00, 599.00, 600.00, 601.00, 600.00, 599.00, 599.00, 599.00, 595.00, 594.00, 594.00, 597.00, 600.00, 600.00, 600.00, 600.00, 596.00, 594.00, 615.00, 637.00, 657.00, 657.00, 657.00, 653.00, 653.00, 653.00, 658.00, 656.00, 635.00, 615.00],
        "indirect": [307.00, 306.00, 307.00, 308.00, 309.00, 308.00, 307.00, 307.00, 307.00, 305.00, 304.00, 304.00, 305.00, 307.00, 307.00, 307.00, 308.00, 306.00, 305.00, 316.00, 327.00, 337.00, 337.00, 337.00, 335.00, 335.00, 335.00, 338.00, 336.00, 325.00, 315.00],
        "direct": [293.00, 292.00, 292.00, 292.00, 292.00, 292.00, 292.00, 292.00, 292.00, 290.00, 290.00, 290.00, 292.00, 293.00, 293.00, 293.00, 292.00, 290.00, 289.00, 299.00, 310.00, 320.00, 320.00, 320.00, 318.00, 318.00, 318.00, 320.00, 320.00, 310.00, 300.00]
      }
    });
  });
  app.get('/api/users/stats/bar-chart-data', function (req, res) {
    res.json([{
      "key": "A",
      "value": [{
        "key": "influencedSales",
        "value": 158
      }, {
        "key": "directSales",
        "value": 154
      }]
    }, {
      "key": "B",
      "value": [{
        "key": "influencedSales",
        "value": 78
      }, {
        "key": "directSales",
        "value": 73
      }]
    }, {
      "key": "C",
      "value": [{
        "key": "influencedSales",
        "value": 22
      }, {
        "key": "directSales",
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





    User.aggregate({
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

      });




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
