const mongoose = require("mongoose");

let dbConnect = async () => {
  let connectionStr =
    "mongodb+srv://sandeepgella016_db_user:sampleTinder%40016@sampletinder.yjy6mnz.mongodb.net/sampleTinder";
  await mongoose.connect(connectionStr);
};

module.exports = dbConnect;
