'use strict';

//require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
//const passport = require('passport');

mongoose.Promise = global.Promise;

//const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require('./config');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(morgan('common'));
//app.use(express.static('public'));
app.get('/api/*', (req, res) => {
   res.json({ok: true});
 });
app.use('*', (req, res) => {
  return res.status(404)/*.sendFile(__dirname + '/public/errorpage.html')*/;
});




 app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

 module.exports = {app};
/*
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer, TEST_DATABASE_URL };*/
 