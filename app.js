var express = require('express'),
  connect = require('connect'),
  fs = require('fs');
var dbURI = 'mongodb://' + process.env.DATABASE_USER + ':' + process.env.DATABASE_PASSWORD + '@dharma.mongohq.com:10073/lucasprus';
var db = require('mongoose').connect(dbURI);
var app = express();
var logFile = fs.createWriteStream('./access.log', {
  flags: 'a'
});
app.use(connect.logger({
  stream: logFile
}));
app.use(connect.compress());
app.use(connect.bodyParser());
app.use(connect.methodOverride());

// app.all('*', express.basicAuth('username', 'password'));
// app.use(express.basicAuth('username', 'password'));
/* 
app.use(express.cookieParser('x6f517kW88eEbmSAWRER8SL578CDCu1ot6Tqlt272sn9sRjrQa'));
app.use(express.session({
    secret: 'x6f517kW88eEbmSAWRER8SL578CDCu1ot6Tqlt272sn9sRjrQa',
    maxAge: 3600000
})); 
*/

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

if ('development' === app.get('env')) {
  app.use(connect.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
} else if ('production' === app.get('env')) {
  app.use(connect.errorHandler());
}
// Routes
require('./routes/users')(app);
var port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});
