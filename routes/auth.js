const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../validation/validation');

//  Registration
router.post('/register', async (req, res) => {
  //  Validate information is as expected
  const { error, value } = validateRegistration(req.body);
  if (error) {
    res.status(400).json({ error: error.details.map((m) => m.message) });
  }

  //  Check if email exists already
  const ifExists = await User.findOne({ email: value.email });
  if (ifExists) {
    res.status(400).json({ error: 'Email already exists' });
  }

  //  Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(value.password, salt);

  //  Process user details and save to DB
  try {
    const user = await new User({
      name: value.name,
      email: value.email,
      password: hashed
    }).save();

    res.status(200).json({ id: user.id });
  } catch (error) {
    res.sendStatus(500).end();
  }
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

module.exports = router;
