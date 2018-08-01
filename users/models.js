'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  affiliationName: {
    type: String,
    required: true
  },
  affiliationAddress: {
    type: String,
    required: true
  },
  affiliationContact: {
    type: String,
    required: true
  }
});

UserSchema.methods.serialize = function() {
	return {username: this.username || '',
  firstName: this.firstName,
  lastName: this.lastName,
  id: this.id || '',
  affiliationName: this.affiliationName || '',
  affiliationAddress: this.affiliationAddress || '',
  affiliationContact: this.affiliationContact || ''
  };
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};