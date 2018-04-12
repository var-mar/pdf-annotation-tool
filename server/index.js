const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('../config');

// Connect to the database and load models
require('./models').connect(config.dbUri);

const app = express();
var server = require('http').createServer(app);
// Tell the app to look for static files in these directories
app.use(express.static('./build/'));
app.use(express.static('./pdfUpload/'));

// Tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: false
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

// Pass the passport middleware
app.use(passport.initialize());

// Load passport strategies
const localSignupStrategy = require('./passport/local-signup');
const localLoginStrategy = require('./passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// Pass the authenticaion checker middleware
const authCheckMiddleware = require('./middleware/auth-check');
app.use('/api', authCheckMiddleware);

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Set Port, hosting services will look for process.env.PORT
app.set('port', (process.env.PORT || 8080));

// Start the server
app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${app.get('port')}`);
});

// Setup websockets

var io = require('socket.io')({ port:8081,wsEngine: 'ws' });
io.on('connection', function (socket) {
  console.log("socket connected");
  //
  socket.on('save', function (data) {
    console.log("socket save");

    //const fs = require('fs');
    //fs.appendFile('answers.csv', data.myAnswers+'\r\n', function (err) { //JSON.stringify(
    if (err) throw err;
      console.log('Saved!');

  });
});
io.listen(8081);
