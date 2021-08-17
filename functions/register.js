const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { validateRegistration } = require('../validation/validation');
const User = require('../models/User');

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);
  console.log(context);
  //  Validate data
  const { error, value } = validateRegistration(body);
  if (error) {
    return {
      status: 400,
      body: JSON.stringify({ message: 'Invalid data\n' + error.details.map((m) => m.message) })
    };
  }

  //  Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(value.password, salt);
  console.log(hashed ? 'Good Hash' : 'No Hash');

  const newUser = new User({
    name: value.name,
    email: value.email,
    password: hashed
  });

  // Set DB connection
  const db = await mongoose.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  //  save to DB
  console.log(newUser);
  const result = await newUser.save();

  if (!!result) {
    db.disconnect();
    return {
      status: 200,
      body: JSON.stringify({ id: user.id })
    };
  } else {
    db.disconnect();
    return {
      status: 500,
      body: JSON.stringify({ error: 'User not saved' })
    };
  }
};
