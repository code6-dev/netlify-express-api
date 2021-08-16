'use strict';

const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
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
  console.log(value);
  if (error) {
    return res.status(400).json({ 'JOI Error': error.details.map((m) => m.message) });
  }
  var newUser;

  //  Hash Password
  const s = await bcrypt.genSalt(10); //.then((s) => s);
  const hashed = await bcrypt.hash(value.password, s); //.then((p) => p);

  if (!!hashed) {
    console.log('Hashed : ' + hashed);
    newUser = new User({
      name: value.name,
      email: value.email,
      password: hashed
    });
  }

  console.log('New User ' + newUser);
  //  DB

  newUser
    .save()
    .then((d) => {
      console.log('Save to DB');
      return res.status(200).json({ id: newUser.id });
    })
    .finally((f) => mongoose.disconnect())
    .catch((err) => {
      mongoose.disconnect();
      return res.status(400).json({ 'Save Error': err });
    });

  // User.find({ email: value.email }, function (err, docs) {
  //   if (docs) {
  //     res.status(400).json({ error: 'Email already exists' });
  //   } else {
  //   }
  // });
  console.log('Done');
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
