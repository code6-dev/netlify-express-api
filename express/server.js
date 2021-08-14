const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const serverless = require('serverless-http');

require('dotenv').config();

//  DB
const mongoose = require('mongoose');
mongoose.connect(
  process.env.DB_HOST,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  },
  () => console.log('DB Connected')
);
// mongoose.connection.close();

const app = express();

//  Middleware
app.use(cors(), helmet(), express.json(), express.urlencoded({ extended: true }));

//  Routes
const authRoute = require('../routes/auth');
const itemRoute = require('../routes/item');

// app.use('/api/user', authRoute);
// app.use('/api/item', itemRoute);
app.use('/.netlify/functions/auth', authRoute); // path must route to lambda
app.use('/.netlify/functions/item', itemRoute); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
