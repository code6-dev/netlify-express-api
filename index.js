const cors = require('cors');
const helmet = require('helmet');
const express = require('express');

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

const app = express();

//  Middleware
app.use(cors(), helmet(), express.json(), express.urlencoded({ extended: true }));

//  Routes
const authRoute = require('./routes/auth');
const itemsRoute = require('./routes/item');

app.use('/api/user', authRoute);
app.use('/api/item', itemsRoute);

app.listen(3001, () => console.log('Server listening on Port 3001'));
