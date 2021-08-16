const app = require('./express/server');
const mongoose = require('mongoose');

mongoose.connect(
  process.env.DB_HOST,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('DB Connected')
);

app.listen(3000, () => console.log('Local server listening on Port 3000'));
