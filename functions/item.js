const router = require('express').Router();
const verify = require('../express/validation/verify');

router.get('/', verify, (req, res) => {
  res.status(200).json({ id: req.user.id });
});

router.get('/:itemId', (req, res) => {
  res.status(200).send('Stuff');
});

router.post('/:item', (req, res) => {
  res.status(200).send('Stuff');
});

module.exports = router;
