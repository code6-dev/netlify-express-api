const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { validateRegistration } = require('../validation/validation');
const User = require('../models/User');

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);

  // Set DB connection
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

  //  Process user details and save to DB
  const newUser = new User({
    name: value.name,
    email: value.email,
    password: hashed
  });

  const result = await newUser.save();

  if (!!result) {
    return {
      status: 200,
      body: JSON.stringify({ id: user.id })
    };
  } else {
    return {
      status: 500,
      body: JSON.stringify({ error: 'User not saved' })
    };
  }
};
