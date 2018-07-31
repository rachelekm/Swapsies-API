'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const { PORT, DATABASE_URL, TEST_DATABASE_URL, CLIENT_ORIGIN } = require('./config');
const app = express();
const cors = require('cors');

const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: usersRouter } = require('./users');
const { router: swapsRouter } = require('./swaps');

mongoose.Promise = global.Promise;

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use(morgan('common'));
//app.use(express.static('public'));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/*', (req, res) => {
   return res.status(200).json({ok: true});
 });

app.get('/', (req, res) => {
   return res.status(200).json({ok: true});
 });

app.use('*', (req, res) => {
  return res.status(404)/*.sendFile(__dirname + '/public/errorpage.html')*/;
});


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

module.exports = { app, runServer, closeServer };
 