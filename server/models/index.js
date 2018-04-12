const mongoose = require('mongoose');

module.exports.connect = (uri) => {
  mongoose.connect(uri,{
  	useMongoClient: true,
  });//createConnection
  // plug in the promise library:
  mongoose.Promise = global.Promise;

  mongoose.connection.on('connected', function() {
    console.log("Mongoose connection established successfully");
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  // Load models
  require('./user');
  require('./pdf');
};
