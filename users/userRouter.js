'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });

const {User} = require('./models');

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['username', 'password', 'firstName', 'lastName', 'affiliationName', 'affiliationAddress', 'affiliationContact'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    	return res.status(422).json({
      	code: 422,
      	reason: 'ValidationError',
      	message: 'Missing field',
      	location: missingField
    	});
  	}

	const stringFields = ['username', 'password', 'firstName', 'lastName', 'affiliationName', 'affiliationAddress', 'affiliationContact'];
  	const nonStringField = stringFields.find(
    	field => field in req.body && typeof req.body[field] !== 'string'
  	);

  	if (nonStringField) {
    	return res.status(422).json({
      	code: 422,
      	reason: 'ValidationError',
      	message: 'Incorrect field type: expected string',
      	location: nonStringField
    	});
  	}

    let nonLettersField = [];
    const nonLetters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")"]
    if(nonLetters.some(item => req.body.firstName.includes(item))){
      nonLettersField.push('firstName');
    }
    if(nonLetters.some(item => req.body.lastName.includes(item))){
      nonLettersField.push('lastName');
    }

    if (nonLettersField.length > 0) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Cannot include numbers of special characters',
        location: nonLettersField
      });
    }

  	const trimmedFields = ['username', 'password'];
  	const nonTrimmedField = trimmedFields.find(
    	field => req.body[field].trim() !== req.body[field]
  	);

  	if (nonTrimmedField) {
    	return res.status(422).json({
      	code: 422,
      	reason: 'ValidationError',
      	message: 'Cannot start or end with whitespace',
      	location: nonTrimmedField
    	});
  	}

  	const sizedFields = {
    	username: {
      	min: 1
    	},
    	password: {
      	min: 8,
      	max: 72
    	}
  	};
	const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  	);
	const tooLargeField = Object.keys(sizedFields).find(
    	field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  	);

	if (tooSmallField || tooLargeField) {
    	return res.status(422).json({
      	code: 422,
      	reason: 'ValidationError',
      	message: tooSmallField
        	? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        	: `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    	});
  	}

  let {username, password, firstName, lastName, affiliationName, affiliationAddress, affiliationContact} = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();
  affiliationName = affiliationName.trim();
  affiliationAddress = affiliationAddress.trim();
  affiliationContact = affiliationContact.trim();

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        firstName,
        lastName,
        affiliationName,
        affiliationAddress,
        affiliationContact,
        password: hash,
        accountCreated: new Date()
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
;
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error', error: err});
    });
});

router.get('/users', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};