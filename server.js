const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 3000;

mongoose
  .connect(
    'mongodb://admin:a123456@ds119996.mlab.com:19996/fcc-exercise-tracker',
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  )
  .then(() => console.log('MongoDB connected ...'))
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(port, function() {
  console.log(`Node.js listening on port ${port} ...`);
});
