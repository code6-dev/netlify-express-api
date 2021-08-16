'use strict';

require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const serverless = require('serverless-http');

const User = require('../express/models/User');
const { validateRegistration, validateLogin } = require('../express/validation/validation');

const app = express();

//  Middleware
app.use(cors(), helmet(), express.json(), express.urlencoded({ extended: true }));

//  Routes
const router = express.Router();

//  Registration
router.post('/register', async (req, res) => {
  //  Validate information is as expected
  const { error, value } = validateRegistration(req.body);
  if (error) {
    res.status(400).json({ error: error.details.map((m) => m.message) });
  }

  //  DB
  const mongoose = require('mongoose');
  mongoose.connect(
    process.env.DB_HOST,
    {
      useNewUrlParser: true,
      useUnifiedTopology: false,
      useFindAndModify: false,
      useCreateIndex: false
    },
    async () => {
      console.log('DB Connected');
      console.log(1);
      //  Check if email exists already
      const ifExists = await User.findOne({ email: value.email });
      if (ifExists) {
        res.status(400).json({ error: 'Email already exists' });
      }
      console.log(2);

      //  Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(value.password, salt);
      console.log(3);

      //  Process user details and save to DB
      try {
        const user = await new User({
          name: value.name,
          email: value.email,
          password: hashed
        })
          .save()
          .then(() => {
            console.log('DB disconnected');
            mongoose.disconnect();
            console.log(4);
          });
        res.status(200).json({ id: user.id });
      } catch (error) {
        mongoose.disconnect();
        res.sendStatus(500).end();
      }
    }
  );
});

//  Login
router.post('/login', async (req, res) => {
  //  Validate information is as expected
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map((m) => m.message) });
  }

  //  Check for user
  const user = await User.findOne({ email: value.email });
  if (!user) {
    return res.status(401).json({ error: 'Email or Password is invalid' });
  }

  //  Validate user
  const verify = await bcrypt.compare(value.password, user.password);
  if (!verify) {
    return res.status(401).json({ error: 'Email or Password is invalid' });
  }

  /*
        user sends JWT token
        in the header for authentication
        instead of email and password
    */

  //  Send Token
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
  res.header('auth-token', token);
  res.sendStatus(200).end();
});

app.use('/.netlify/functions/auth', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
