const mongoose = require('mongoose');


const dbUrl = 'mongodb://localhost:27017/stepup';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));


  module.exports = mongoose
