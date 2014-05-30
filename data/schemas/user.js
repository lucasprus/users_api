var mongoose = require('mongoose'),
  // request = require('request'),
  emailRegexp = /.+\@.+\..+/,
  alphaNumericRegexp = /^[a-z0-9]+$/i,
  TIMESPAN_YEAR = 31536000000,
  TIMESPAN_18_YEARS = 18 * TIMESPAN_YEAR;

function escape(str) {
  return (str.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;'));
}

function validate_18_years_old_or_more(date) {
  if (!date) {
    return;
  }
  return (Date.now() - date.getTime()) > TIMESPAN_18_YEARS;
}

/*function twitterHandleExists(handle, done) {
    if (!handle) {
      return;
    }
    request('http://twitter.com/' + encodeURIComponent(handle), function (err, res) {
      if (err) {
        console.error(err);
        return done(false);
      }
      if (res.statusCode > 299) {
        done(false);
      } else {
        done(true);
      }
    });
  }*/

/*function filterTwitterHandle(handle) {
    if (!handle) {
      return;
    }
    handle = handle.trim();
    if (handle.indexOf('@') === 0) {
      handle = handle.substring(1);
    }
    return handle;
  }
  */
function range(l, r) {
  return function (a) {
    return a.length >= l && a.length <= r;
  };
}
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    match: alphaNumericRegexp,
    validate: [
      range(5, 25),
      'Username must be minimum 5 characters and maximum 25 characters'
    ]
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    validate: [
      range(5, 15),
      'Password must be minimum 5 characters and maximum 15 characters'
    ]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: emailRegexp
  },
  gender: {
    type: String,
    required: true,
    uppercase: true,
    'enum': ['M', 'F']
  },
  birthday: {
    type: Date,
    required: true,
    validate: [
      validate_18_years_old_or_more,
      'You must be 18 years old or more'
    ]
  },
  bio: {
    type: String
  },
  twitter: {
    type: String
  },
  meta: {
    created_at: {
      type: Date
    },
    updated_at: {
      type: Date
    }
  }
});
UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.created_at = Date.now();
  }
  this.meta.updated_at = Date.now();

  this.username = escape(this.username);
  this.name = escape(this.name);
  this.email = escape(this.email);
  this.password = escape(this.password);
  this.bio = escape(this.bio);

  next();
});
UserSchema.virtual('twitter_url')
  .get(function () {
    if (this.twitter) {
      return 'http://twitter.com/' + encodeURIComponent(this.twitter);
    }
  });
/* UserSchema.virtual('full_name')
      .get(function () {
          if (typeof this.name === 'string') {
              return this.name;
          }
          return [this.name.first, this.name.last].join(' ');
      })
      .set(function (fullName) {
          var nameComponents = fullName.split(' ');
          this.name = {
              last: nameComponents.pop(),
              first: nameComponents.join(' ')
          };
      }); */
/* UserSchema.methods.recentArticles = function (callback) {
      return this.model('Article')
          .find({
              author: this._id
          })
          .sort('created_at')
          .limit(5)
          .exec(callback);
  }; */
module.exports = UserSchema;
