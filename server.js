const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();

const User = require('./models/User');
const Exercise = require('./models/Exercise');

const port = process.env.PORT || 3000;
const MongoDB = process.env.MLAB_URI;

mongoose
  .connect(MongoDB, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log('MongoDB connected ...'))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/api/exercise/users', (req, res) => {
  User.find()
    .select('_id username')
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: err }));
});

app.post('/api/exercise/new-user', (req, res) => {
  if (!req.body.username) {
    res.json({ error: 'No username submitted' });
  } else {
    const newUser = new User({ username: req.body.username });
    newUser
      .save()
      .then(user => res.json({ userId: user._id, username: user.username }))
      .catch(err => res.status(500).json({ error: err }));
  }
});

app.post('/api/exercise/add', (req, res) => {
  if (!req.body.userId || !req.body.description || !req.body.duration) {
    res.json({ error: 'Invalid data submitted' });
  } else {
    // find user
    let username;
    User.findOne({ _id: req.body.userId }, (err, user) => {
      if (err) res.json('Error while searching for user id');
      else if (!user) res.json('User nor found');
      else {
        username = user.username;
        const newExercise = new Exercise({
          userId: req.body.userId,
          description: req.body.description,
          duration: +req.body.duration,
          date: req.body.date ? new Date(req.body.date) : new Date()
        });
        newExercise
          .save()
          .then(exercise =>
            res.json({
              username,
              userId: exercise.userId,
              description: exercise.description,
              duration: exercise.duration,
              date: exercise.date
            })
          )
          .catch(err => res.status(500).json({ error: err }));
      }
    });
  }
});

app.get('/api/exercise/log', (req, res) => {
  if (!req.query.userId) res.send('You must provide an user id');
  const userId = req.query.userId;
  let from, to;
  if (req.query.from) {
    from = new Date(req.query.from);
    if (from == 'Invalid Date' || to == 'Invalid Date')
      res.send('from field must be yyyy-mm-dd');
  }
  if (req.query.to) {
    to = new Date(req.query.to);
    if (to == 'Invalid Date' || to == 'Invalid Date')
      res.send('to field must be yyyy-mm-dd');
  }
  const limit = +req.query.limit || 100;

  // find user name
  let username;
  User.findOne({ _id: userId }, (err, user) => {
    if (err) res.json({ message: 'Could not find user' });
    else {
      username = user.username;
    }
  });

  const filter = {
    userId
  };

  const date = {};
  if (from) date.$gte = from;
  if (to) date.$lte = to;
  if (Object.keys(date).length !== 0) filter.date = date;

  // find exercise log
  Exercise.find(filter)
    .select('description duration date')
    .limit(limit)
    .sort('-date')
    .exec((err, log) => {
      if (err) res.json({ message: "Could not find user's exercise log" });
      else {
        res.json({ username, log, count: log.length });
      }
    });
});

app.listen(port, function() {
  console.log(`Node.js listening on port ${port} ...`);
});
